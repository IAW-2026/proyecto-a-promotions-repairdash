"use client";

const RIDER_APP_URL = process.env.NEXT_PUBLIC_RIDER_APP_URL!;

export default function RiderAppLink() {
  const handleClick = () => {
    const confirmed = window.confirm(
      "¿Estás seguro que querés abandonar la app de promociones para ir a RIDER APP?"
    );
    if (confirmed) {
      window.location.href = RIDER_APP_URL;
    }
  };

  return (
    <div className="w-full flex justify-center">
      <p
        className="
          flex items-center gap-2 text-white text-sm
          sm:text-xl
        "
      >
        Hacé uso de las promociones en
        <button
          onClick={handleClick}
          className="
            inline-flex items-center
            bg-[#F500F1]
            text-[#271033]
            font-bold sm:font-extrabold
            px-2 py-0.5
            sm:px-3 sm:py-1
            rounded-md
            hover:bg-[#F500F1]/80
            transition-colors
            cursor-pointer
            whitespace-nowrap
            text-s sm:text-base
          "
        >
          RiderApp
        </button>
      </p>
    </div>
  );
}