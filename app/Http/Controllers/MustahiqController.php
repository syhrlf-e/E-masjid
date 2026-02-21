<?php

namespace App\Http\Controllers;

use App\Models\Mustahiq;
use App\Http\Requests\StoreMustahiqRequest;
use App\Http\Requests\UpdateMustahiqRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MustahiqController extends Controller
{
    public function index(): Response
    {
        $query = Mustahiq::query();

        if (request('search')) {
            $query->where('name', 'like', '%' . request('search') . '%');
        }

        if (request('ashnaf')) {
            $query->where('ashnaf', request('ashnaf'));
        }

        $mustahiqs = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($mustahiq) => [
                'id' => $mustahiq->id,
                'name' => $mustahiq->name,
                'ashnaf' => $mustahiq->ashnaf,
                'address' => $mustahiq->address,
                'description' => $mustahiq->description,
            ]);

        return Inertia::render('Zakat/Mustahiq/Index', [
            'mustahiqs' => $mustahiqs,
            'filters' => request()->only(['search', 'ashnaf']),
        ]);
    }

    public function store(StoreMustahiqRequest $request): RedirectResponse
    {
        Mustahiq::create($request->validated());

        return redirect()->back()->with('success', 'Mustahiq berhasil ditambahkan.');
    }

    public function update(UpdateMustahiqRequest $request, Mustahiq $mustahiq): RedirectResponse
    {
        $mustahiq->update($request->validated());

        return redirect()->back()->with('success', 'Data Mustahiq berhasil diperbarui.');
    }

    public function destroy(Mustahiq $mustahiq): RedirectResponse
    {
        $mustahiq->delete();

        return redirect()->back()->with('success', 'Mustahiq berhasil dihapus.');
    }
}
