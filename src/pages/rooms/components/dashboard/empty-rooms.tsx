import { useApiMutation } from "../../../../../hooks/use-api-mutation.ts";

("useClient");

import { Image } from "@heroui/react";
import { Button } from "@heroui/button";
import { useOrganization } from "@clerk/clerk-react";
import { addToast } from "@heroui/toast";

import { api } from "../../../../../convex/_generated/api";

const EmptyRooms = () => {
  const { mutate, pending } = useApiMutation(api.room.create);
  const { organization } = useOrganization();

  const onPress = () => {
    if (!organization) return;

    mutate({
      organizationId: organization.id,
      title: "Untitled",
    })
      .then((id) => {
        addToast({
          title: "Successfully Created New Room",
          description: "saving changes...",
          variant: "bordered",
          color: "success",
        });
        // TODO: redirect to board/{id}
      })
      .catch(() =>
        addToast({
          title: "Something went wrong",
          description: "please try again later...",
          variant: "bordered",
          color: "warning",
        }),
      );
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Image
        alt="Empty Rooms"
        className={"sm:h-96 sm:w-96"}
        src="/no_organization.png"
      />
      <h2 className="text-3xl font-bold leading-tight">No rooms!</h2>
      <p className="text-lg text-gray-500 mt-2">
        Create a room to get started!
      </p>
      <div className="mt-6">
        <Button
          color={"secondary"}
          disabled={pending}
          variant="bordered"
          onPress={onPress}
        >
          Create Room
        </Button>
      </div>
    </div>
  );
};

export default EmptyRooms;
