import { Module } from '@nestjs/common';
import { ReportController } from './controller/report.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from './models/report.entity';
import { ReportService } from './service/report.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportEntity])
  ],
  providers: [ReportService],
  controllers: [ReportController]
})
export class ReportModule {}
