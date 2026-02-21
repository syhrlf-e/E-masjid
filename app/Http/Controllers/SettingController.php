<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSettingRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class SettingController extends Controller
{
    use AuthorizesRequests;

    /**
     * Display a listing of the settings.
     */
    public function index(): Response
    {
        $this->authorize('viewAny', Setting::class);

        $settings = Setting::all()->keyBy('key')->map->value;

        // Default state minimal if empty
        $defaultSettings = [
            'masjid_name' => 'Sistem Manajemen Masjid',
            'masjid_address' => '',
            'contact_phone' => '',
            'zakat_fitrah_amount' => '40000',
        ];

        $mergedSettings = array_merge($defaultSettings, $settings->toArray());

        return Inertia::render('Settings/Index', [
            'settings' => $mergedSettings,
        ]);
    }

    /**
     * Update the specified settings in storage.
     */
    public function store(UpdateSettingRequest $request): RedirectResponse
    {
        $this->authorize('update', Setting::class);

        DB::transaction(function () use ($request) {
            foreach ($request->validated()['settings'] as $key => $value) {
                if ($value !== null) {
                    Setting::updateOrCreate(
                        ['key' => $key],
                        ['value' => $value]
                    );
                }
            }
            activity()->log('updated settings');
        });

        return redirect()->back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
