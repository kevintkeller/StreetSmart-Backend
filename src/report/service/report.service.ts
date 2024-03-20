import { Injectable, Post } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { ReportEntity } from '../models/report.entity';
import { Double, Repository } from 'typeorm';
import { Report } from '../models/report.interface';
import { Observable, map, switchMap, catchError, throwError, from, EMPTY } from 'rxjs';


@Injectable()
export class ReportService {

    constructor(
        @InjectRepository(ReportEntity) private readonly reportRepository: Repository<ReportEntity>
    ){}

    public create(report: Report): Observable<void | Report> {

        const newReport = new ReportEntity();
        newReport.title = report.title;
        newReport.content = report.content;
        newReport.latitude = new Double(report.latitude);
        newReport.longitude = new Double(report.longitude);
        newReport.userId = report.userId;
        newReport.reportStatus = 0;
        newReport.imageData = report.imageData;
        console.log(newReport);
        
        return from(this.reportRepository.save(newReport)).pipe(
            map((report: ReportEntity) => {
                const {...result} = report;
                return;
            }),
            catchError((err, caught) => {
                console.log(err);
                return EMPTY;
            })
        )
    }

    public findOneBy(reportId: number): any {
        return this.reportRepository.query("SELECT userId FROM report_entity WHERE reportId = " + reportId);
    }

    // this one is done
    public deleteOne(reportId: number): Observable<any> {
        return from(this.reportRepository.delete(reportId));
    }

    public  findAll(): Observable<ReportEntity[]> {
        return from(this.reportRepository.find()).pipe(
            map((reports) => {
                return reports;
            })
        );
    }

    public updateOne(id: number, reportStatus: number): any {
        this.reportRepository.query("UPDATE report_entity SET reportStatus = " + reportStatus + " WHERE reportId = " + id);
    }

}
