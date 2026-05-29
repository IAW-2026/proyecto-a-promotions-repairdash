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
      <p className="text-xl text-white flex items-center gap-2">
        Hacé uso de las promociones en
        <button
          onClick={handleClick}
          className="
            inline-flex items-center
            bg-[#F500F1]
            text-[#271033]
            font-extrabold
            px-3 py-1
            rounded-md
            hover:bg-[#F500F1]/80
            transition-colors
            cursor-pointer
            whitespace-nowrap
          "
        >
          RiderApp
        </button>
      </p>
    </div>
  );
}