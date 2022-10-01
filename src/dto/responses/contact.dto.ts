import LatestMessageContactDto from "./latestMessageContact.dto";
import UserContactDto from "./userContact.dto";

export default class Contact {
    user: UserContactDto;
    latestMessage?: LatestMessageContactDto;
}