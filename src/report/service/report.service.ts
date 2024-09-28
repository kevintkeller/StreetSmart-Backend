import { ReportTypes } from './../models/report-types.interface';
import { Inject, Injectable, Post } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { ReportEntity } from '../models/report.entity';
import { DeleteResult, Double, getRepository, Repository } from 'typeorm';
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

    public async createNewReport(report: Report): Promise<boolean> {
        try {
            const result = await this.reportRepository.save(report);
            return result ? true : false;
        } catch (error) {
            console.error('An error occurred while creating a new report', error);
            return false;
        }
    }

    public async getReportByReportId(reportId: number): Promise<Report> {
        return this.reportRepository.createQueryBuilder('report_entity')
            .where('report_entity.reportId = :reportId', { reportId })
            .getOne();
    }

    public async deleteReportByReportId(reportId: number): Promise<boolean> {
        try {
            const result = await this.reportRepository.delete(reportId);
            if (result.affected > 0) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('An error occurred while deleting the report', error);
            return false;
        }
    }

    public getAllReportsByCity(cityId: number): Promise<Report[]> {
        return this.reportRepository.createQueryBuilder('report_entity')
            .where('report_entity.cityId = :cityId', { cityId })
            .getMany();
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
