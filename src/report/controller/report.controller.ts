import { Body, Controller, Delete, Get, Post, Query, ParseIntPipe } from '@nestjs/common';
import { ReportService } from '../service/report.service';
import { Report } from '../models/report.interface';
import { Public } from 'src/common/decorator/public.decorator';
import { ReportContact } from '../models/report-contact.interface';
import { ReportTypes } from '../models/report-types.interface';
import { ReportStatus } from '../models/report-status.interface';

@Controller('report')
export class ReportController {

    constructor(private reportService: ReportService) {}

    @Public()
    @Post()
    public async createNewReport(
        @Body() report: Report
    ): Promise<boolean> {
        return this.reportService.createNewReport(report);
    }

    @Public()
    @Get()
    public async getAllReportsByCity(
            @Query('cityId') cityId: number
    ): Promise<Report[]> {
        return this.reportService.getAllReportsByCity(cityId);
    }

    @Public()
    @Get('get-report-by-report-id')
    public async getReportByReportId(
        @Query('reportId') reportId: number
    ): Promise<Report> {
        return this.reportService.getReportByReportId(reportId);
    }

    @Public()
    @Delete(':reportId')
    public async deleteReportByReportId(
        @Query('reportId') reportId: string
    ): Promise<boolean> {
        return this.reportService.deleteReportByReportId(Number(reportId));
    }

    @Public()
    @Get('get-all-report-contacts')
    public async getAllReportContacts(
        @Query('cityId') cityId: number, 
    ): Promise<ReportContact[]> {
        return await this.reportService.getAllReportContacts(cityId);
    }

    @Public()
    @Post('delete-report-contact')
    public async deleteReportContact(
        @Query('reportContactId', ParseIntPipe) reportContactId: number
    ): Promise<boolean> {
        return await this.reportService.deleteReportContact(reportContactId);
    }

    @Public()
    @Post('create-report-contact')
    public async createReportContact(
        @Body() body: ReportContact
    ): Promise<boolean> {
        return await this.reportService.createReportContact(body);
    }

    @Public()
    @Get('get-all-report-types')
    public async getAllReportTypes(
        @Query('cityId') cityId: number
    ): Promise<ReportTypes[]> {
        return await this.reportService.getAllReportTypes(cityId);
    }

    @Public()
    @Post('delete-report-type')
    public async deleteReportType(
        @Query('reportTypeId', ParseIntPipe) reportTypeId: number
    ): Promise<boolean> {
        return await this.reportService.deleteReportType(reportTypeId);
    }

    @Public()
    @Post('create-or-update-report-type')
    public async createOrUpdateReportType(
        @Body() body: ReportTypes
    ): Promise<boolean> {
        return await this.reportService.createOrUpdateReportType(body);
    }

    @Public()
    @Get('get-all-report-statuses')
    public async getAllReportStatuses(
        @Query('cityId') cityId: number
    ): Promise<ReportStatus[]> {
        return await this.reportService.getAllReportStatuses(cityId);
    }

    @Public()
    @Get('get-report-status-by-id')
    public async getReportStatusById(
        @Query('reportStatusId') reportStatusId: number
    ): Promise<ReportStatus> {
        return await this.reportService.getReportStatusById(reportStatusId);
    }

    @Public()
    @Post('delete-report-status')
    public async deleteReportStatus(
        @Query('reportStatusId', ParseIntPipe) reportStatusId: number
    ): Promise<boolean> {
        return await this.reportService.deleteReportStatus(reportStatusId);
    }

    @Public()
    @Post('create-or-update-report-status')
    public async createReportStatus(
        @Body() body: ReportStatus
    ): Promise<boolean> {
        return await this.reportService.createOrUpdateReportStatus(body);
    }
}