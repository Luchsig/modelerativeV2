import { Image } from "@heroui/react";

const EmptyOrganization = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Image
        alt="Empty Search"
        height={300}
        src="/nothing_found_2.svg"
        width={300}
      />
      <h2 className="text-3xl font-bold leading-tight">No results found!</h2>
      <p className="text-lg text-gray-500 mt-2">
        Try searching for something else
      </p>
    </div>
  );
};

export default EmptyOrganization;
