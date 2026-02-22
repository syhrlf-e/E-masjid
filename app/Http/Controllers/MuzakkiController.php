<?php

namespace App\Http\Controllers;

use App\Models\Donatur;
use App\Imports\MuzakkiImport;
use App\Http\Requests\StoreMuzakkiRequest;
use App\Http\Requests\UpdateMuzakkiRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Request as RequestFacade;
use Inertia\Inertia;
use Inertia\Response;

class MuzakkiController extends Controller
{
    public function index(): Response
    {
        $query = Donatur::query();

        if (request('search')) {
            $query->where('name', 'like', '%' . request('search') . '%')
                  ->orWhere('phone', 'like', '%' . request('search') . '%');
        }

        $userRole = request()->user()->role;
        $canViewPrivateData = in_array($userRole, ['super_admin', 'bendahara']);

        $muzakkis = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($donatur) => [
                'id' => $donatur->id,
                'name' => $donatur->name,
                'phone' => $canViewPrivateData ? $donatur->phone : ($donatur->phone ? '*** (Rahasia)' : null),
                'address' => $canViewPrivateData ? $donatur->address : ($donatur->address ? 'Dirahasiakan' : null),
            ]);

        return Inertia::render('Zakat/Muzakki/Index', [
            'muzakkis' => $muzakkis,
            'filters' => request()->only(['search']),
        ]);
    }

    public function store(StoreMuzakkiRequest $request): RedirectResponse
    {
        Donatur::create($request->validated());

        return redirect()->back()->with('success', 'Muzakki berhasil ditambahkan.');
    }

    public function update(UpdateMuzakkiRequest $request, Donatur $muzakki): RedirectResponse
    {
        $muzakki->update($request->validated());

        return redirect()->back()->with('success', 'Data Muzakki berhasil diperbarui.');
    }

    public function destroy(Donatur $muzakki): RedirectResponse
    {
        $muzakki->delete();

        return redirect()->back()->with('success', 'Muzakki berhasil dihapus.');
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120',
        ]);

        $import = new MuzakkiImport();
        $import->import($request->file('file'));

        $failures = $import->failures();
        $importedCount = $import->getImportedCount() - count($failures);

        if (count($failures) > 0) {
            $errorRows = collect($failures)->map(fn ($f) => "Baris {$f->row()}: {$f->errors()[0]}")->take(5)->join(', ');
            return redirect()->back()->with('warning', "Berhasil import {$importedCount} data. {$errorRows}");
        }

        return redirect()->back()->with('success', "Berhasil import {$importedCount} data Muzakki.");
    }
}

