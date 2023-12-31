import { Module } from '@nestjs/common';
import { UserService } from '../services/user/user.service';
import { UserController } from '../controllers/user/user.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "../entities/user.entity";
import {UserRepository} from "../repositories/user.repository";
import { AuthEmailService } from "@libs/mail/auth-email/auth-email.service";
import { EmailEngineModule } from "@libs/mail/email-engine/email-engine.module";

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, AuthEmailService],
  exports: [UserService],
  imports: [
    MongooseModule.forFeature([
        { name: User.name, schema: UserSchema },
    ]),
    EmailEngineModule
  ],
})
export class UserModule {}
