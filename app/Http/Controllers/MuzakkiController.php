<?php

namespace App\Http\Controllers;

use App\Models\Donatur;
use App\Http\Requests\StoreMuzakkiRequest;
use App\Http\Requests\UpdateMuzakkiRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Request; // Use Facade for Request::input, etc. but method injection is better.
use Inertia\Inertia;
use Inertia\Response;

class MuzakkiController extends Controller
{
    public function index(): Response
    {
        // Add Authorization here if needed, e.g., $this->authorize('viewAny', Donatur::class);
        
        $query = Donatur::query();

        if (request('search')) {
            $query->where('name', 'like', '%' . request('search') . '%')
                  ->orWhere('phone', 'like', '%' . request('search') . '%');
        }

        $muzakkis = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($donatur) => [
                'id' => $donatur->id,
                'name' => $donatur->name,
                'phone' => $donatur->phone,
                'address' => $donatur->address,
                // Add total donation calculation here if needed later
            ]);

        return Inertia::render('Zakat/Muzakki/Index', [
            'muzakkis' => $muzakkis,
            'filters' => request()->only(['search']),
        ]);
    }

    public function store(StoreMuzakkiRequest $request): RedirectResponse
    {
        // Authorization: $this->authorize('create', Donatur::class);

        Donatur::create($request->validated());

        return redirect()->back()->with('success', 'Muzakki berhasil ditambahkan.');
    }

    public function update(UpdateMuzakkiRequest $request, Donatur $muzakki): RedirectResponse
    {
        // Authorization: $this->authorize('update', $muzakki);

        $muzakki->update($request->validated());

        return redirect()->back()->with('success', 'Data Muzakki berhasil diperbarui.');
    }

    public function destroy(Donatur $muzakki): RedirectResponse
    {
        // Authorization: $this->authorize('delete', $muzakki);

        $muzakki->delete();

        return redirect()->back()->with('success', 'Muzakki berhasil dihapus.');
    }
}
