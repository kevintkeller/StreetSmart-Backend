import { Injectable, Post } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { ReportEntity } from '../models/report.entity';
import { Repository } from 'typeorm';
import { Report } from '../models/report.interface';
import { Observable, map, switchMap, catchError, throwError, from } from 'rxjs';


@Injectable()
export class ReportService {

    constructor(
        @InjectRepository(ReportEntity) private readonly reportRepository: Repository<ReportEntity>
    ){}

    create(report: Report): Observable<void | Report> {

        const newReport = new ReportEntity();
        newReport.title = report.title;
        newReport.content = report.content;
        newReport.latitude = Number(report.latitude);
        newReport.longitude = Number(report.longitude);
        newReport.userId = report.userId;
        
        return from(this.reportRepository.save(newReport)).pipe(
            map((post: ReportEntity) => {
                const {...result} = post;
                return;
            }),
            catchError(err => throwError(err))
        )
    }

    findOneBy(reportId: number): any {
        return this.reportRepository.query("SELECT userId FROM report_entity WHERE reportId = " + reportId);
    }

    // this one is done
    deleteOne(reportId: number): Observable<any> {
        return from(this.reportRepository.delete(reportId));
    }

    findAll(): Observable<ReportEntity[]> {
        return from(this.reportRepository.find()).pipe(
            map((reports) => {
                return reports;
            })
        );
    }

    updateOne(id: number, reportStatus: number): any {
        this.reportRepository.query("UPDATE report_entity SET reportStatus = " + reportStatus + " WHERE reportId = " + id);
    }

}
