import { Image } from "@heroui/react";

const EmptyOrganization = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Image
        alt="Empty Organization"
        className={"object-cover sm:h-96 sm:w-96"}
        height={500}
        src="/no_organization.png"
        width={500}
      />
      <h2 className="text-3xl font-bold leading-tight">Welcome to Rooms</h2>
      <p className="text-lg text-gray-500 mt-2">
        Create or join an organization to get started
      </p>
    </div>
  );
};

export default EmptyOrganization;
