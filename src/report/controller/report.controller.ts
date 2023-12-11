import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ReportService } from '../service/report.service';
import { Report } from '../models/report.interface';
import { Observable, catchError, map, of } from 'rxjs';
import { ReportEntity } from '../models/report.entity';

@Controller('report')
export class ReportController {

    constructor(private reportService: ReportService){}

    @Post()
    create(@Body()report: Report): Observable<Report | Object> {
        //console.log("hit" + report.imageData);
        return this.reportService.create(report).pipe(
            map((report: Report) => report),
            catchError(err => of({error: err.message}))
        );
    }

    @Get(':reportId')
    findOneBy(@Param()params: any) {
        return this.reportService.findOneBy(params.reportId);
    }

    @Get()
    findAll(): Observable<ReportEntity[]> {
        return this.reportService.findAll();
    }

    @Delete(':reportId')
    deleteOne(@Param('reportId')reportId: string): Observable<Report> {
        return this.reportService.deleteOne(Number(reportId));
    }

    @Post('updateReportStatus')
    updateOne(@Body() report: any) {
        this.reportService.updateOne(report.id, report.reportStatus);
    }
    
}