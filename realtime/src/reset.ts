import { Transaction } from "./db";
import {
  Auth_TB,
  Client_TB,
  InFlight_TB,
  Message_TB,
  Node_TB,
  Server_TB,
  User_TB,
} from "./schema";
import { User } from "core/user";
import { desc } from "drizzle-orm";

type SimpleNode = {
  id: string;
  left: string;
  right: string;
  inboxSize: number;
};
type NewNode = typeof Node_TB.$inferInsert;

const expandSimpleNode = (simpleNode: SimpleNode, version: number): NewNode => {
  return {
    nodeId: simpleNode.id,
    leftNeighbor: simpleNode.left,
    rightNeighbor: simpleNode.right,
    inboxSize: simpleNode.inboxSize,
    status: "active",
    label: simpleNode.id,
    version: version,
  };
};

const defaultNodes: SimpleNode[] = [
  {
    id: "N1",
    left: "N10",
    right: "N2",
    inboxSize: 5,
  },
  {
    id: "N2",
    left: "N1",
    right: "N4",
    inboxSize: 5,
  },
  {
    id: "N4",
    left: "N2",
    right: "N5",
    inboxSize: 5,
  },
  {
    id: "N5",
    left: "N4",
    right: "N12",
    inboxSize: 5,
  },
  {
    id: "N12",
    left: "N5",
    right: "N7",
    inboxSize: 5,
  },
  {
    id: "N7",
    left: "N12",
    right: "N8",
    inboxSize: 5,
  },
  {
    id: "N8",
    left: "N7",
    right: "N17",
    inboxSize: 5,
  },
  {
    id: "N17",
    left: "N8",
    right: "N10",
    inboxSize: 5,
  },
  {
    id: "N10",
    left: "N17",
    right: "N1",
    inboxSize: 5,
  },
];

type SimpleUser = {
  firstName: string;
  lastName: string;
  type: "admin" | "operator";
};

type NewUser = typeof User_TB.$inferInsert;

const expandSimpleUser = (simpleUser: SimpleUser): NewUser => {
  return {
    userId: User.createUsername(simpleUser.firstName, simpleUser.lastName),
    name: `${simpleUser.firstName} ${simpleUser.lastName}`,
    email: "harrisd@smu.edu",
    type: simpleUser.type,
  };
};

const defaultUsers: SimpleUser[] = [
  {
    firstName: "Laura",
    lastName: "Simson",
    type: "admin",
  },
  {
    firstName: "Huang",
    lastName: "Yang",
    type: "admin",
  },
  {
    firstName: "Smith",
    lastName: "Johnson",
    type: "admin",
  },
  {
    firstName: "Micah",
    lastName: "Adrene",
    type: "admin",
  },
  {
    firstName: "Azim",
    lastName: "Mohammed",
    type: "operator",
  },
  {
    firstName: "Suraj",
    lastName: "Patel",
    type: "operator",
  },
  {
    firstName: "Lima",
    lastName: "Dunken",
    type: "operator",
  },
  {
    firstName: "Alice",
    lastName: "Troff",
    type: "operator",
  },
  {
    firstName: "Logan",
    lastName: "Kroner",
    type: "operator",
  },
  {
    firstName: "Kate",
    lastName: "Briggs",
    type: "operator",
  },
];

type SimpleMessage = {
  node: string;
  where: "Inbox" | "Store";
  from: string;
  to: string;
  direction: "left" | "right";
  path: string[];
  status:
    | "Delivered"
    | "NotDelivered-NodeInactive"
    | "NotDelivered-InboxFull"
    | "NotDelivered-NodeNotFound";
  messageId: string;
  message: string;
};

type NewMessage = typeof Message_TB.$inferInsert;

const expandSimpleMessage = (
  simpleMessage: SimpleMessage,
  version: number,
): NewMessage => {
  return {
    messageId: simpleMessage.messageId,
    label: simpleMessage.messageId,
    senderId: simpleMessage.from,
    reciverId: simpleMessage.to,
    message: simpleMessage.message,
    createdAt: new Date().toISOString(),
    receivedAt: new Date().toISOString(),
    direction: simpleMessage.direction,
    path: simpleMessage.path,
    status: simpleMessage.status,
    seen: simpleMessage.where == "Store",
    placement: simpleMessage.status == "Delivered" ? "node" : "system-buffer",
    deleted: false,
    version: version,
  };
};

const defaultMessages: SimpleMessage[] = [
  {
    node: "N1",
    where: "Inbox",
    from: "N2",
    to: "N1",
    direction: "left",
    path: ["N2", "N1"],
    status: "Delivered",
    messageId: "N2M8",
    message: "Would you like to join us for a group study?",
  },
  {
    node: "N1",
    where: "Inbox",
    from: "N8",
    to: "N1",
    direction: "right",
    path: ["N8", "N17", "N10", "N1"],
    status: "Delivered",
    messageId: "N8M11",
    message: "There is a tutorial session today",
  },
  {
    node: "N1",
    where: "Inbox",
    from: "N12",
    to: "N1",
    direction: "left",
    path: ["N12", "N5", "N4", "N2", "N1"],
    status: "Delivered",
    messageId: "N12M2",
    message: "Can I join your group for discussion?",
  },
  {
    node: "N1",
    where: "Inbox",
    from: "N5",
    to: "N1",
    direction: "left",
    path: ["N5", "N4", "N2", "N1"],
    status: "Delivered",
    messageId: "N5M12",
    message: "I did not see N3 in the ring. Is it active or was it removed?",
  },
  // N1 Store Messages
  {
    node: "N1",
    where: "Store",
    from: "N2",
    to: "N1",
    direction: "left",
    path: ["N2", "N1"],
    status: "Delivered",
    messageId: "N2M2",
    message: "Hi I am your neighbor",
  },
  {
    node: "N1",
    where: "Store",
    from: "N10",
    to: "N1",
    direction: "right",
    path: ["N10", "N1"],
    status: "Delivered",
    messageId: "N10M1",
    message: "I am your neighbor and jusy joined",
  },
  {
    node: "N1",
    where: "Store",
    from: "N12",
    to: "N1",
    direction: "right",
    path: ["N12", "N7", "N8", "N17", "N10", "N1"],
    status: "Delivered",
    messageId: "N12M1",
    message: "Hi I a new member joining the ring",
  },
  {
    node: "N2",
    where: "Inbox",
    from: "N1",
    to: "N2",
    direction: "right",
    path: ["N1", "N2"],
    status: "Delivered",
    messageId: "N1M2",
    message: "Acknowledgment: Hi neighbor",
  },
  {
    node: "N2",
    where: "Inbox",
    from: "N12",
    to: "N2",
    direction: "left",
    path: ["N12", "N5", "N4", "N2"],
    status: "Delivered",
    messageId: "N12M3",
    message: "Can I join your group for discussion?",
  },
  {
    node: "N2",
    where: "Inbox",
    from: "N8",
    to: "N2",
    direction: "left",
    path: ["N8", "N7", "N12", "N5", "N4", "N2"],
    status: "Delivered",
    messageId: "N8M2",
    message: "There is a tutorial session today",
  },
  {
    node: "N2",
    where: "Inbox",
    from: "N10",
    to: "N2",
    direction: "right",
    path: ["N10", "N1", "N2"],
    status: "Delivered",
    messageId: "N10M4",
    message: "I just let you know that your neighbor N3 has been removed",
  },
  // N2 Store Messages
  {
    node: "N2",
    where: "Store",
    from: "N2",
    to: "N2",
    direction: "left",
    path: ["N2", "N2"],
    status: "Delivered",
    messageId: "N2M1",
    message: "Testing self message",
  },
  {
    node: "N2",
    where: "Store",
    from: "N4",
    to: "N2",
    direction: "left",
    path: ["N4", "N2"],
    status: "Delivered",
    messageId: "N4M6",
    message: "Leaving today",
  },
  {
    node: "N2",
    where: "Store",
    from: "N5",
    to: "N2",
    direction: "left",
    path: ["N5", "N4", "N2"],
    status: "Delivered",
    messageId: "N5M4-2",
    message: "I do not come today because N4 is leaving today",
  },
  {
    node: "N2",
    where: "Store",
    from: "N10",
    to: "N2",
    direction: "right",
    path: ["N10", "N1", "N2"],
    status: "Delivered",
    messageId: "N10M2",
    message: "I would like to join your group",
  },
  {
    node: "N4",
    where: "Store",
    from: "N2",
    to: "N4",
    direction: "right",
    path: ["N2", "N4"],
    status: "Delivered",
    messageId: "N2M4",
    message: "Are you still available?",
  },
  {
    node: "N4",
    where: "Store",
    from: "N2",
    to: "N4",
    direction: "right",
    path: ["N2", "N4"],
    status: "Delivered",
    messageId: "N2M5",
    message: "If you are still in town, can you bring your laptop?",
  },
  {
    node: "N4",
    where: "Store",
    from: "N12",
    to: "N4",
    direction: "left",
    path: ["N12", "N5", "N4"],
    status: "Delivered",
    messageId: "N12M3-2",
    message: "I would like to join your group",
  },
  // N10 Inbox Messages
  {
    node: "N10",
    where: "Inbox",
    from: "N1",
    to: "N10",
    direction: "left",
    path: ["N1", "N10"],
    status: "Delivered",
    messageId: "N1M1-3",
    message: "I am your new neighbor",
  },
  {
    node: "N10",
    where: "Inbox",
    from: "N12",
    to: "N10",
    direction: "right",
    path: ["N12", "N7", "N8", "N17", "N10"],
    status: "Delivered",
    messageId: "N12M4-4",
    message: "Hi I am a new member joining the ring",
  },
  {
    node: "N10",
    where: "Inbox",
    from: "N7",
    to: "N10",
    direction: "right",
    path: ["N7", "N8", "N10"],
    status: "Delivered",
    messageId: "N7M7",
    message: "There was a connection problem with N8 before",
  },
  {
    node: "N10",
    where: "Inbox",
    from: "N8",
    to: "N10",
    direction: "right",
    path: ["N8", "N10"],
    status: "Delivered",
    messageId: "N8M3",
    message: "I have a problem connecting with other nodes",
  },
  {
    node: "N10",
    where: "Inbox",
    from: "N1",
    to: "N10",
    direction: "right",
    path: ["N1", "N2", "N4", "N5", "N12", "N7", "N8", "N17", "N10"],
    status: "Delivered",
    messageId: "N1M4",
    message: "Testing the full ring connection; please acknowledge",
  },
  // N10 Store Messages
  {
    node: "N10",
    where: "Store",
    from: "N1",
    to: "N10",
    direction: "left",
    path: ["N1", "N10"],
    status: "Delivered",
    messageId: "N1M3",
    message: "Testing neighborhood connection",
  },
  {
    node: "N10",
    where: "Store",
    from: "N10",
    to: "N10",
    direction: "left",
    path: ["N10", "N10"],
    status: "Delivered",
    messageId: "N10M5-2",
    message: "Testing self message",
  },
  {
    node: "N10",
    where: "Store",
    from: "N7",
    to: "N10",
    direction: "right",
    path: ["N7", "N8", "N10"],
    status: "Delivered",
    messageId: "N7M3",
    message: "Are you the administrator of the network?",
  },
  {
    node: "N10",
    where: "Store",
    from: "N7",
    to: "N10",
    direction: "right",
    path: ["N7", "N8", "N10"],
    status: "Delivered",
    messageId: "N7M4-2",
    message: "I want to check the network status",
  },
  // N10 Inbox Messages
  {
    node: "N10",
    where: "Inbox",
    from: "N1",
    to: "N10",
    direction: "left",
    path: ["N1", "N10"],
    status: "Delivered",
    messageId: "N1M1-2",
    message: "I am your new neighbor",
  },
  {
    node: "N10",
    where: "Inbox",
    from: "N12",
    to: "N10",
    direction: "right",
    path: ["N12", "N7", "N8", "N17", "N10"],
    status: "Delivered",
    messageId: "N12M4-2",
    message: "Hi I am a new member joining the ring",
  },
  {
    node: "N10",
    where: "Inbox",
    from: "N7",
    to: "N10",
    direction: "right",
    path: ["N7", "N8", "N10"],
    status: "Delivered",
    messageId: "N7M7-2",
    message: "There was a connection problem with N8 before",
  },
  {
    node: "N10",
    where: "Inbox",
    from: "N8",
    to: "N10",
    direction: "right",
    path: ["N8", "N10"],
    status: "Delivered",
    messageId: "N8M3-2",
    message: "I have a problem connecting with other nodes",
  },
  {
    node: "N10",
    where: "Inbox",
    from: "N1",
    to: "N10",
    direction: "right",
    path: ["N1", "N2", "N4", "N5", "N12", "N7", "N8", "N17", "N10"],
    status: "Delivered",
    messageId: "N1M4-2",
    message: "Testing the full ring connection; please acknowledge",
  },
  // N10 Store Messages
  {
    node: "N10",
    where: "Store",
    from: "N1",
    to: "N10",
    direction: "left",
    path: ["N1", "N10"],
    status: "Delivered",
    messageId: "N1M3-2",
    message: "Testing neighborhood connection",
  },
  {
    node: "N10",
    where: "Store",
    from: "N10",
    to: "N10",
    direction: "left",
    path: ["N10", "N10"],
    status: "Delivered",
    messageId: "N10M5",
    message: "Testing self message",
  },
  {
    node: "N10",
    where: "Store",
    from: "N7",
    to: "N10",
    direction: "right",
    path: ["N7", "N8", "N10"],
    status: "Delivered",
    messageId: "N7M3-2",
    message: "Are you the administrator of the network?",
  },
  {
    node: "N10",
    where: "Store",
    from: "N7",
    to: "N10",
    direction: "right",
    path: ["N7", "N8", "N10"],
    status: "Delivered",
    messageId: "N7M4",
    message: "I want to check the network status",
  },
  // N5 Store Messages
  {
    node: "N5",
    where: "Store",
    from: "N1",
    to: "N5",
    direction: "right",
    path: ["N1", "N2", "N3", "N4", "N5"],
    status: "Delivered",
    messageId: "N1M9",
    message: "I will introduce you to N3",
  },
  {
    node: "N5",
    where: "Store",
    from: "N1",
    to: "N5",
    direction: "right",
    path: ["N1", "N2", "N4", "N5"],
    status: "Delivered",
    messageId: "N1M7",
    message: "Sorry, N3 is removed from the network",
  },

  // System Buffer (SB) Messages
  {
    node: "SB",
    where: "Store",
    from: "N12",
    to: "N10",
    direction: "right",
    path: ["N12", "N7"],
    status: "NotDelivered-NodeInactive",
    messageId: "N12M6",
    message: "I would like to talk to you",
  },
  {
    node: "SB",
    where: "Store",
    from: "N1",
    to: "N10",
    direction: "right",
    path: ["N1", "N2", "N4", "N5"],
    status: "NotDelivered-NodeInactive",
    messageId: "N1M6",
    message: "Trying to reach the administrator",
  },
  {
    node: "SB",
    where: "Store",
    from: "N5",
    to: "N10",
    direction: "right",
    path: ["N5", "N12", "N7", "N8", "N17"],
    status: "NotDelivered-InboxFull",
    messageId: "N5M4",
    message: "Are you the administrator of the network?",
  },
  {
    node: "SB",
    where: "Store",
    from: "N2",
    to: "N16",
    direction: "left",
    path: ["N2", "N1", "N10", "N17", "N8", "N7", "N12", "N5", "N4"],
    status: "NotDelivered-NodeNotFound",
    messageId: "N2M7",
    message: "Hi would you like to join the meeting?",
  },
  {
    node: "SB",
    where: "Store",
    from: "N7",
    to: "N1",
    direction: "right",
    path: ["N7", "N8", "N17"],
    status: "NotDelivered-NodeInactive",
    messageId: "N7M9",
    message: "I thought you administer the network",
  },
];

export const reset = async (tx: Transaction) => {
  const highestVersion = await tx
    .select()
    .from(Client_TB)
    .orderBy(desc(Client_TB.version))
    .then((a) => a.at(0));
  let highestNumber = highestVersion ? highestVersion.version : 0;
  highestNumber += 100;

  const highestServerVersion = await tx
    .select()
    .from(Server_TB)
    .orderBy(desc(Server_TB.version))
    .then((a) => a.at(0));

  if (highestServerVersion) {
    if (highestServerVersion.version > highestNumber) {
      highestNumber = highestServerVersion.version;
    }
  }

  await tx.delete(Server_TB);
  await tx.delete(Node_TB);
  await tx.delete(InFlight_TB);
  await tx.delete(Message_TB);

  await tx.delete(Client_TB);
  await tx.delete(Auth_TB);
  await tx.delete(User_TB);

  await tx
    .insert(Node_TB)
    .values(defaultNodes.map((s) => expandSimpleNode(s, highestNumber)));
  await tx.insert(User_TB).values(defaultUsers.map((s) => expandSimpleUser(s)));
  await tx
    .insert(Message_TB)
    .values(defaultMessages.map((s) => expandSimpleMessage(s, highestNumber)));

  // Add the admin user
  await tx.insert(User_TB).values([
    {
      userId: "root",
      name: "root",
      email: "root@root.com",
      type: "admin",
    },
  ]);
  await tx.insert(Auth_TB).values([
    {
      userId: "root",
      password: "root",
      hasReset: true,
    },
  ]);

  await tx.insert(Server_TB).values([
    {
      id: "server",
      version: highestNumber,
    },
  ]);
};
