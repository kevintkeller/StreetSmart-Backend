import { Body, Controller, Delete, Get, Param, Post, Headers } from '@nestjs/common';
import { ReportService } from '../service/report.service';
import { Report } from '../models/report.interface';
import { Observable, catchError, map, of } from 'rxjs';
import { ReportEntity } from '../models/report.entity';
import { Public } from 'src/common/decorator/public.decorator';
import { Request } from 'express';

@Controller('report')
export class ReportController {

    constructor(private reportService: ReportService){}

    @Post()
    create(@Headers('withCredentials') withCredentials: string, @Body()report: Report): Observable<Report | Object> {
        console.log(report);
        return this.reportService.create(report).pipe(
            map((report: Report) => report),
            catchError(err => of({error: err.message}))
        );
    }

    @Public()
    @Get(':reportId')
    findOneBy(@Param()params: any) {
        return this.reportService.findOneBy(params.reportId);
    }

    @Public()
    @Get()
    findAll(): Observable<ReportEntity[]> {
        return this.reportService.findAll();
    }

    @Public()
    @Delete(':reportId')
    deleteOne(@Param('reportId')reportId: string): Observable<Report> {
        return this.reportService.deleteOne(Number(reportId));
    }

    @Public()
    @Post('updateReportStatus')
    updateOne(@Body() report: any) {
        this.reportService.updateOne(report.id, report.reportStatus);
    }

}