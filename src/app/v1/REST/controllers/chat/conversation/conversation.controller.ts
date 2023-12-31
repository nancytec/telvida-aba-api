import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ConversationService } from '../../../services/chat/conversation/conversation.service';
import { CreateConversationDto } from '../../../dto/chat/conversation/create-conversation.dto';
import { GetCurrentUserId } from '@libs/decorators';
import ResponseController, {
  IResponseWithData,
  IResponseWithDataCollection,
  IResponseWithMessage,
} from '@libs/helpers/response-controller';
import { Request } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { allowedFileTypes, maxFileSize } from '@config/constants';
import { DeleteConversationDto } from '@app/v1/REST/dto/chat/conversation/delete-conversation.dto';

@Controller('conversations')
export class ConversationController extends ResponseController {
  constructor(private readonly conversationService: ConversationService) {
    super();
  }

  // Multiple file for attachments upload
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FilesInterceptor('files', 500, {
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase();
        if (allowedFileTypes.includes(ext)) {
          callback(null, true);
        } else {
          callback(new Error('Invalid file type.'), false);
        }
      },
      limits: {
        fileSize: maxFileSize,
      },
      storage: diskStorage({
        destination: './uploads/conversations',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async create(
    @Body() createConversationDto: CreateConversationDto,
    @GetCurrentUserId() userId: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ): Promise<IResponseWithData> {
    const response_data = await this.conversationService.create(
      createConversationDto,
      files,
      userId,
    );
    return this.responseWithData(response_data);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Req() req: Request,
    @GetCurrentUserId() userId: string,
  ): Promise<IResponseWithDataCollection> {
    const response_data = await this.conversationService.findAll(req, userId);
    return this.responseWithDataCollection(response_data);
  }

  @Delete()
  @HttpCode(HttpStatus.ACCEPTED)
  async remove(
    @Body() deleteConversationDto: DeleteConversationDto,
    @GetCurrentUserId() userId: string,
  ): Promise<IResponseWithMessage> {
    await this.conversationService.remove(deleteConversationDto, userId);
    return this.responseMessage('Conversation deleted');
  }
}
