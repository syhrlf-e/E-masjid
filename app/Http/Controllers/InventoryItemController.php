<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInventoryItemRequest;
use App\Http\Requests\UpdateInventoryItemRequest;
use App\Models\InventoryItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class InventoryItemController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', InventoryItem::class);

        $items = InventoryItem::with('creator:id,name')
            ->latest()
            ->paginate(10);

        return Inertia::render('Inventaris/Index', [
            'items' => $items,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreInventoryItemRequest $request): RedirectResponse
    {
        $this->authorize('create', InventoryItem::class);

        DB::transaction(function () use ($request) {
            $item = InventoryItem::create([
                ...$request->validated(),
                'created_by' => auth()->id(),
            ]);

            activity()->on($item)->log('created');
        });

        return redirect()->back()->with('success', 'Barang inventaris berhasil ditambahkan.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateInventoryItemRequest $request, InventoryItem $inventoryItem): RedirectResponse
    {
        $this->authorize('update', $inventoryItem);

        DB::transaction(function () use ($request, $inventoryItem) {
            $inventoryItem->update($request->validated());
            activity()->on($inventoryItem)->log('updated');
        });

        return redirect()->back()->with('success', 'Barang inventaris berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(InventoryItem $inventoryItem): RedirectResponse
    {
        $this->authorize('delete', $inventoryItem);

        DB::transaction(function () use ($inventoryItem) {
            $inventoryItem->delete();
            activity()->on($inventoryItem)->log('deleted');
        });

        return redirect()->back()->with('success', 'Barang inventaris berhasil dihapus.');
    }
}
