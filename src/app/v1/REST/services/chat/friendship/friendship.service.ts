import { Injectable, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { UserService } from "@app/v1/REST/services/user/user.service";
import { FriendshipRepository } from "@app/v1/REST/repositories/friendship.repository";
import { Friendship } from "@app/v1/REST/entities/friendship.entity";
import mongoose from "mongoose";
import { Request } from "express";
import { IFilterableCollection } from "@libs/helpers/response-controller";
import { events } from "@config/constants";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { FriendshipDeletedEvent } from "@app/v1/REST/events/chat/friendship/friendship-deleted.event";

@Injectable()
export class FriendshipService {
  constructor(
    private readonly friendshipRepo: FriendshipRepository,
    private readonly userService: UserService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(initiator_id: string, receiver_id: string): Promise<Friendship> {

    // Check if the initiator id is valid.
    if (!mongoose.isValidObjectId(initiator_id)){
      throw new NotAcceptableException(`Invalid initiator id: ${initiator_id}`)
    }

    // check if the receiver id is valid.
    if (!mongoose.isValidObjectId(receiver_id)){
      throw new NotAcceptableException(`Invalid receiver id: ${receiver_id}`)
    }

    // Create the friendship connection.
    return this.friendshipRepo.create({
      initiator_id,
      receiver_id
    });
  }

  async findOne(id: string): Promise<Friendship> {
    // verify the id
    if (!mongoose.isValidObjectId(id)){
      throw new NotAcceptableException(`Invalid friendship id: ${id}`)
    }

    const friendship = await this.friendshipRepo.documentExist({ _id: id });
    if (!friendship){
      throw new NotFoundException(`Friendship not found with the id: ${id}`)
    }

    return friendship;
  }

  async findAll(req: Request): Promise<IFilterableCollection> {
    return this.friendshipRepo.findAllFiltered(req);
  }

  async remove(id: string): Promise<boolean> {
    // Check if the id is valid.
    if (!mongoose.isValidObjectId(id)){
      throw new NotAcceptableException(`Invalid friendship id: ${id}`)
    }

    const friendship = await this.friendshipRepo.documentExist({ _id: id });
    if (!friendship){
      throw new NotFoundException(`Friendship with the id: ${id} not found`)
    }

    // Delete the friendship
    await this.friendshipRepo.findAndDelete({ _id: id });

    // Dispatch friendship deleted event
    this.eventEmitter.emit(events.FRIENDSHIP_DELETED, new FriendshipDeletedEvent(friendship.initiator_id, friendship.receiver_id));
    return true;
  }
}
