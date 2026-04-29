<?php

namespace App\Http\Controllers;

use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    public function __construct(private ChatbotService $chatbotService) {}

    /**
     * POST /api/chatbot/message
     * Protégé par auth:sanctum
     */
    public function message(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:500',
        ]);

        try {
            $result = $this->chatbotService->handle(
                $request->input('message'),
                $request->user()->load('departement')
            );

            return response()->json($result);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Une erreur est survenue. Veuillez réessayer.',
            ], 500);
        }
    }
}
