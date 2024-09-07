export const SidebarMessageList = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <div className="text-lg font-bold">Messages</div>
        <div className="flex flex-col gap-2">
          <div className="text-sm">
            <div className="font-bold">
              <div className="inline-block w-4 h-4 rounded-full bg-green-500"></div>
              <div className="inline-block w-4 h-4 rounded-full bg-red-500"></div>
            </div>
            <div className="text-xs">
              <div className="font-bold">
                <div className="inline-block w-4 h-4 rounded-full bg-green-500"></div>
                <div className="inline-block w-4 h-4 rounded-full bg-red-500"></div>
              </div>
              <div className="text-xs">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                molestie, neque non scelerisque ultricies, nisl dolor aliquet
                sapien, vel pulvinar nisi nisl eget nunc.
              </div>
            </div>
          </div>
          {/* TODO: Add more messages */}
        </div>
      </div>
    </div>
  );
};
