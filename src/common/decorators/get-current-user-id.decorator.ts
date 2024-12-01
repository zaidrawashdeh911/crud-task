import { createParamDecorator, ExecutionContext, UnauthorizedException} from "@nestjs/common";

export const GetCurrentUserId = createParamDecorator(
  (data: undefined, context: ExecutionContext): number=>{
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    //console.log(user.sub)
  if(!user || !user.sub) throw new UnauthorizedException('user not auth');

  return user.sub;
  }
);