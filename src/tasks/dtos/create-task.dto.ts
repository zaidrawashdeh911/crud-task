import { IsString, IsOptional, IsNotEmpty, IsDate, IsArray } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  picture?: string;

  @IsArray()
  @IsOptional()
  subTasks?: CreateTaskDto[];
}
