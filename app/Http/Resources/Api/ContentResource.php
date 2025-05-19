<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->id,
            'order' => (int) $this->order,
            'chapter_id' => $this->chapter_id,
            'youtube_contents' => $this->whenLoaded('youtubeContents', function () {
                return $this->youtubeContents->map(function ($youtubeContent) {
                    return [
                        'id' => $youtubeContent->id,
                        'title' => $youtubeContent->title,
                        'url' => $youtubeContent->url,
                    ];
                });
            }),
            'file_contents' => $this->whenLoaded('fileContents', function () {
                return $this->fileContents->map(function ($fileContent) {
                    return [
                        'id' => $fileContent->id,
                        'title' => $fileContent->title,
                        'file_url' => $fileContent->file_url,
                    ];
                });
            }),
        ];
    }
}
