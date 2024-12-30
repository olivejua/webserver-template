
## Project setup

```bash
$ npm install
```

## Setting
```bash
$ npm install @nestjs/config
$ npm install @nestjs/typeorm
$ npm install class-validator class-transformer
$ npm install @nestjs/passport passport passport-local @nestjs/jwt bcrypt
$ npm install --save-dev @types/bcrypt
$ npm install ioredis
$ npm i -D @types/multer
$ npm install @aws-sdk/client-s3 -> 클라우드 서버와 통신
$ npm install @aws-sdk/s3-request-presigner -> url 생성
$ npm install --save-dev jest @types/jest ts-jest @nestjs/testing
```

- docker compose 세팅

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.


## 프로젝트 구조
```text
src/
├── main.ts          # 애플리케이션 진입점
├── app.module.ts    # 루트 모듈
├── app.controller.ts # 메인 컨트롤러
├── app.service.ts   # 메인 서비스
├── modules/         # 모듈별 디렉토리
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth-jwt.guard.ts
│   │   ├── jwt.strategy.ts
├── common/         # 공통 유틸리티 및 데코레이터
│   ├── filters/    # 예외 필터
│   ├── interceptors/ # 인터셉터
│   ├── pipes/      # 파이프
│   ├── decorators/ # 커스텀 데코레이터
│   ├── guards/     # 공통 가드
├── config/         # 환경 변수 및 설정
├── test/           # 테스트 코드
└── assets/         # 정적 파일 및 리소스
```
