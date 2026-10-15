import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationRegistrationVersionEntity } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.entity';
import { ApplicationRegistrationVersionService } from 'src/engine/core-modules/application/application-registration-version/application-registration-version.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationRegistrationVersionEntity,
      ApplicationRegistrationEntity,
    ]),
    FileUrlModule,
  ],
  providers: [ApplicationRegistrationVersionService],
  exports: [ApplicationRegistrationVersionService],
})
export class ApplicationRegistrationVersionModule {}
