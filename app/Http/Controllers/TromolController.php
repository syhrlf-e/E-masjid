<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTromolInputRequest;
use App\Models\TromolBox;
use App\Services\TransactionService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TromolController extends Controller
{
    use AuthorizesRequests;
    protected $transactionService;

    public function __construct(TransactionService $transactionService)
    {
        $this->transactionService = $transactionService;
    }

    public function index()
    {
        $this->authorize('viewAny', TromolBox::class);

        $tromolBoxes = TromolBox::all()->map(function ($box) {
            $data = $box->toArray();
            $data['signed_url'] = \Illuminate\Support\Facades\URL::signedRoute('tromol.input', ['tromolBox' => $box->id]);
            return $data;
        });

        return Inertia::render('Tromol/Index', [
            'tromolBoxes' => $tromolBoxes,
        ]);
    }

    public function history()
    {
        $this->authorize('viewAny', TromolBox::class);
        
        $transactions = \App\Models\Transaction::with(['tromolBox', 'creator:id,name'])
            ->whereNotNull('tromol_box_id')
            ->latest()
            ->paginate(15);
            
        return Inertia::render('Tromol/History', [
            'transactions' => $transactions
        ]);
    }

    public function input(Request $request, TromolBox $tromolBox)
    {
        if (! $request->hasValidSignature()) {
            abort(403, 'Invalid or expired URL.');
        }

        if ($tromolBox->status !== 'active') {
             abort(403, 'Tromol Box is inactive.');
        }

        return Inertia::render('Tromol/Input', [
            'tromolBox' => $tromolBox,
        ]);
    }

    public function store(StoreTromolInputRequest $request, TromolBox $tromolBox)
    {
        if (! $request->hasValidSignature()) {
            abort(403, 'Invalid or expired URL.');
        }

        if ($tromolBox->status !== 'active') {
             abort(403, 'Tromol Box is inactive.');
        }

        $validated = $request->validated();

        // Admin/Petugas logged in? Or public?
        // Requirement: "Input cepat petugas". Tromol input is likely by officer via QR.
        // If public, we need a user. But `created_by` is in Transaction table.
        // Assuming the officer is logged in on the device scanning the QR?
        // OR the signed URL is for an authenticated session?
        // If the user selects "Scan QR" on their dashboard, they are logged in.
        // If the QR is on the box and they scan with phone camera, they need to log in first?
        // Let's assume the user must be logged in to access this route or at least `store`.
        // The `StoreTromolInputRequest` authorize is true (or check permission).

        // If 'input' is open to public, `created_by` cannot be null.
        // But the requirement says "Scan QR Code (Signed URL) untuk input cepat petugas."
        // So User IS Petugas.
        
        $this->transactionService->store([
            'type' => 'in',
            'category' => 'infaq_tromol',
            'amount' => $validated['amount'],
            'payment_method' => 'tunai', // Cash in box
            'tromol_box_id' => $tromolBox->id,
            'notes' => 'Tromol Input via QR',
        ], $request->user());

        return redirect()->route('dashboard')->with('success', 'Infaq recorded successfully.');
    }
}
