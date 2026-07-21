import { urlFor } from "./image";
import type { SanityAsset, SanityImageSource } from "@sanity/image-url";

/** Sanity image asset (dereferenced document). photoType.image, artistType.photo/members[].photo 가
 *  GROQ `image.asset->` 등으로 투영한 결과. urlFor 가 _id 로 CDN URL 을 만든다. */
export type PhotoAsset = SanityAsset;

/** urlFor 입력 — _ref, _id, asset object 등 어떤 형식이든 받는다. */
type UrlForSource = SanityImageSource;

/** falsy asset 일 때 반환하는 빈 src. FotoApp / MusicApp 호출처가 truthy 가정으로
 *  동작하지만( normalize 단계에서 asset 없는 사진 제외 ), data fetch 실패·잘못된 ref 등
 *  방어적 fallback. <Image src=""> 는 부모 layout 안에서 안전하게 처리. */
const EMPTY_SRC = "";

/** 그리드 썸네일 — 4:3 crop. FolderGrid/폴더 내 그리드에서 사용. */
export function photoThumbSrc(asset: PhotoAsset | null | undefined, size = 480): string {
  if (!asset) return EMPTY_SRC;
  return urlFor(asset as UrlForSource)
    .width(size)
    .height(Math.round((size * 3) / 4))
    .fit("crop")
    .auto("format")
    .quality(85)
    .url();
}

/** info 패널 — 720x540 crop. FotoApp 의 선택 사진 큰 미리보기. */
export function photoPanelSrc(asset: PhotoAsset | null | undefined): string {
  if (!asset) return EMPTY_SRC;
  return urlFor(asset as UrlForSource).width(720).height(540).fit("crop").auto("format").quality(88).url();
}

/** 라이트박스 — 1600 wide, 원본 비율 유지. contain 표시. */
export function photoLightboxSrc(asset: PhotoAsset | null | undefined): string {
  if (!asset) return EMPTY_SRC;
  return urlFor(asset as UrlForSource).width(1600).auto("format").quality(92).url();
}

/** 정사각형 아바타 — fit crop. MusicApp 의 ArtistAvatar (아티스트/멤버). */
export function photoAvatarSrc(asset: PhotoAsset | null | undefined, size = 96): string {
  if (!asset) return EMPTY_SRC;
  return urlFor(asset as UrlForSource)
    .width(size)
    .height(size)
    .fit("crop")
    .auto("format")
    .quality(85)
    .url();
}
