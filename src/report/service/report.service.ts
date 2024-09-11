import { ReportTypes } from './../models/report-types.interface';
import { Inject, Injectable, Post } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { ReportEntity } from '../models/report.entity';
import { Double, getRepository, Repository } from 'typeorm';
import { Report } from '../models/report.interface';
import { Observable, map, switchMap, catchError, throwError, from, EMPTY } from 'rxjs';
import { ReportContactEntity } from '../models/report-contact.entity';
import { ReportContact } from '../models/report-contact.interface';
import { ReportTypesEntity } from '../models/report-types.entity';
import { ReportStatusEntity } from '../models/report-status.entity';
import { ReportStatus } from '../models/report-status.interface';

@Injectable()
export class ReportService {

    constructor(
        @InjectRepository(ReportEntity) private readonly reportRepository: Repository<ReportEntity>,
        @InjectRepository(ReportContactEntity) private readonly reportContactRepository: Repository<ReportContactEntity>,
        @InjectRepository(ReportTypesEntity) private readonly reportTypesRepository: Repository<ReportTypes>,
        @InjectRepository(ReportStatusEntity) private readonly reportStatusesRepository: Repository<ReportStatus>,
    ){}

    public create(report: Report): Observable<void | Report> {
        const newReport = new ReportEntity();
        newReport.title = report.title;
        newReport.content = report.content;
        newReport.latitude = report.latitude;
        newReport.longitude = report.longitude;
        newReport.userId = report.userId;
        newReport.reportStatus = 0;
        newReport.imageData = report.imageData;
        
        return from(this.reportRepository.save(newReport)).pipe(
            map((report: ReportEntity) => {
                console.log(report.content);
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

    public findAll(): Observable<ReportEntity[]> {
        return from(this.reportRepository.find()).pipe(
            map((reports) => {
                return reports;
            })
        );
    }

    public updateOne(id: number, reportStatus: number): any {
        this.reportRepository.query("UPDATE report_entity SET reportStatus = " + reportStatus + " WHERE reportId = " + id);
    }

    public async getAllReportTypes(cityId: number): Promise<ReportTypes[]> {
        return this.reportTypesRepository.createQueryBuilder('report_types_entity')
            .where('report_types_entity.cityId = :cityId', { cityId })
            .getMany();
    }

    public async deleteReportType(reportTypeId: number): Promise<boolean> {
        try {
            const result = await this.reportTypesRepository.delete(reportTypeId);
            return result.affected > 0;
        } catch (error) {
            console.error('Error deleting report status', error);
            return false;
        }
    }

    public async createOrUpdateReportType(reportType: ReportTypes): Promise<boolean> {
        try {
            const result = await this.reportTypesRepository.save(reportType);

            return result ? true : false;
        } catch (error) {
            console.error('Error creating new report type', error);
            return false;
        }
    }

    public async getAllReportContacts(cityId: number): Promise<ReportContact[]> {
        return await this.reportContactRepository.createQueryBuilder('report_contact_entity')
            .where('report_contact_entity.cityId = :cityId', { cityId })
            .getMany();
    }

    public async deleteReportContact(reportContactId: number): Promise<boolean> {
        try {
            const result = await this.reportContactRepository.delete(reportContactId);
            return result.affected > 0;
        } catch (error) {
            console.error('Error deleting report status', error);
            return false;
        }
    }

    public async createReportContact(reportContact: ReportContact): Promise<boolean> {
        try {
            const result = await this.reportContactRepository.save(reportContact);
            return result ? true : false;
        } catch (error) {
            console.error('Error creating new report contact', error);
            return false;
        }
    }

    public async getAllReportStatuses(cityId: number): Promise<ReportStatus[]> {
        return await this.reportStatusesRepository.createQueryBuilder('report_status_entity')
            .where('report_status_entity.cityId = :cityId', { cityId })
            .getMany();
    }

    public async deleteReportStatus(reportStatusId: number): Promise<boolean> {
        try {
            const result = await this.reportStatusesRepository.delete(reportStatusId);
            return result.affected > 0;
        } catch (error) {
            console.error('Error deleting report status', error);
            return false;
        }
    }

    public async createOrUpdateReportStatus(reportStatus: ReportStatus): Promise<boolean> {
        try {
            const result = await this.reportStatusesRepository.save(reportStatus);
            return result ? true : false;
        } catch (error) {
            console.error('Error creating new report status', error);
            return false;
        }
    }

}
