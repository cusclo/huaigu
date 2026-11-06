#!/usr/bin/env bash
# 由 public/img/{portraits,sites}/*.jpg 生成按需加载的 WebP 缩略图：
#   thumb/sm/<id>.webp  短边 96px（名录、对话头像等 ≤48px 的小图，2x 屏）
#   thumb/md/<id>.webp  短边 360px（浮卡、生平页大图，2x 屏）
# 原图保留作为加载失败时的回退。依赖 ImageMagick（magick）。
set -euo pipefail
cd "$(dirname "$0")/../public/img"
for dir in portraits sites; do
  for size in sm:96 md:360; do
    name=${size%%:*}; px=${size##*:}
    mkdir -p "$dir/thumb/$name"
    for f in "$dir"/*.jpg; do
      id=$(basename "$f" .jpg)
      out="$dir/thumb/$name/$id.webp"
      [[ -f "$out" && "$out" -nt "$f" ]] && continue
      magick "$f" -auto-orient -resize "${px}x${px}^>" -strip -quality 78 "$out"
    done
  done
done
du -sh */thumb/* | sed 's/^/  /'
