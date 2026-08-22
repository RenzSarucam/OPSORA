<?php

namespace App\Http\Controllers;

use App\Http\Requests\Server\StoreServerRequest;
use App\Http\Requests\Server\UpdateServerRequest;
use App\Http\Resources\ServerResource;
use App\Models\Server;

class ServerController extends Controller
{
    public function index()
    {
        $servers = Server::orderBy('name')->get();

        return ServerResource::collection($servers);
    }

    public function store(StoreServerRequest $request)
    {
        $server = Server::create($request->validated());

        return new ServerResource($server->fresh());
    }

    public function show(Server $server)
    {
        return new ServerResource($server);
    }

    public function update(UpdateServerRequest $request, Server $server)
    {
        $server->update($request->validated());

        return new ServerResource($server);
    }

    public function destroy(Server $server)
    {
        $server->delete();

        return response()->noContent();
    }
}