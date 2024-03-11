import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ChatDto {
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayNotEmpty()
  participants: string[];

  @IsNotEmpty()
  @IsString()
  @IsIn(['private', 'group'])
  type: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  groupName: string;
}
