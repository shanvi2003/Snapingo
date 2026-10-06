import Image from "next/image";

// Top bar for the below-lg "Desktop Only" screens (admin/staff login and
// PanelShell) - the full pink Snapingo wordmark (icon + text), pinned to
// the top of its `relative` parent.
export default function DesktopOnlyBrandBar() {
  return (
    <header className="absolute inset-x-0 top-0 flex h-18 items-center border-b border-ink-100 bg-white px-4 sm:px-6 lg:hidden">
      <span className="relative block h-9 w-[171px]">
        <Image
          src="/snapingo-wordmark-horizontal.png"
          alt="Snapingo"
          fill
          sizes="171px"
          className="object-contain object-left"
          unoptimized
        />
      </span>
    </header>
  );
}
