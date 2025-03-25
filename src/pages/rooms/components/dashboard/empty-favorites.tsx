import { Image } from "@heroui/react";

const EmptyFavorites = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Image
        alt="Empty Favorites"
        className={"object-cover sm:h-96 sm:w-96"}
        src="/no_organization.png"
      />
      <h2 className="text-3xl font-bold leading-tight">No favorite rooms!</h2>
      <p className="text-lg text-gray-500 mt-2">Try favoring some rooms</p>
    </div>
  );
};

export default EmptyFavorites;
