import { Module } from '@nestjs/common';
import { ReportController } from './controller/report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from './models/report.entity';
import { ReportService } from './service/report.service';
import { ReportTypesEntity } from './models/report-types.entity';
import { ReportContactEntity } from './models/report-contact.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportEntity, ReportTypesEntity, ReportContactEntity]),
  ],
  providers: [ReportService],
  controllers: [ReportController]
})
export class ReportModule {}
