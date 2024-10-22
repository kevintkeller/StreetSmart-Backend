import { ReportTypes } from './../models/report-types.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReportEntity } from '../models/report.entity';
import { Repository } from 'typeorm';
import { Report } from '../models/report.interface';
import { ReportContactEntity } from '../models/report-contact.entity';
import { ReportContact } from '../models/report-contact.interface';
import { ReportTypesEntity } from '../models/report-types.entity';
import { ReportStatusEntity } from '../models/report-status.entity';
import { ReportStatus } from '../models/report-status.interface';
import { TransformedReportContact } from '../models/transformed-report-contact.interface';

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
            report.resolvedDate = null;
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

    public async getReportsByReportTypeId(reportTypeId: number): Promise<Report[]> {
        return this.reportRepository.createQueryBuilder('report_entity')
            .where('report_entity.reportTypeId = :reportTypeId', { reportTypeId })
            .getMany();
    }

    public async getReportsByReportStatusId(reportStatusId: number): Promise<Report[]> {
        return this.reportRepository.createQueryBuilder('report_entity')
            .where('report_entity.reportStatusId = :reportStatusId', { reportStatusId })
            .getMany();
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

    public async deleteReportContactsByReportTypeId(reportTypeId: number): Promise<boolean> {
        try {
            const result = await this.reportContactRepository.createQueryBuilder('report_contact_entity')
                .delete()
                .from('report_contact_entity')
                .where('report_contact_entity.reportTypeId = :reportTypeId', { reportTypeId })
                .execute();  // Add .execute() to run the delete
    
            return result.affected > 0;
        } catch (error) {
            console.error('Error deleting report contact with the reportTypeId of ' + reportTypeId, error);
            return false;
        }
    }

    // TODO: refactor reportcontactentity and where it's used to have user id field on top of storing email to be a better primary key instead of trying to string match
    public async deleteReportContactsByEmail(email: string): Promise<boolean> {
        try {
            const result = await this.reportContactRepository.createQueryBuilder('report_contact_entity')
                .delete()
                .from('report_contact_entity')
                .where('report_contact_entity.email = :email', { email })
                .execute();

            return result.affected > 0;
        } catch (error) {
            console.error('Error deleting report contacts for the user: ' + email);
            return false;
        }
    }

    public async transformReportContacts(reportContactList: ReportContact[]): Promise<TransformedReportContact[]> {
        try {
            let transformedReportContacts: TransformedReportContact[] = [];
            for (let reportContact of reportContactList) {
                const reportTypeId: number = reportContact.reportTypeId;
                const reportTypesObject: ReportTypes = await this.reportTypesRepository.createQueryBuilder('report_types_entity')
                    .where('report_types_entity.reportTypeId = :reportTypeId', { reportTypeId })
                    .getOne();
                if (reportTypesObject) {
                    const transformedReportContact: TransformedReportContact = {
                        reportContactId: reportContact.reportContactId,
                        email: reportContact.email,
                        reportType: reportTypesObject.reportType,
                        cityId: reportContact.cityId
                    };
                    transformedReportContacts.push(transformedReportContact);
                } else {
                    this.deleteReportContactsByReportTypeId(reportTypeId);
                }
            }
            return transformedReportContacts;
        } catch (error) {
            console.error('Error transforming report contacts', error);
            return [];
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

    public async getReportStatusById(reportStatusId: number): Promise<ReportStatus> {
        return await this.reportStatusesRepository.createQueryBuilder('report_status_entity')
            .where('report_status_entity.reportStatusId = :reportStatusId', { reportStatusId })
            .getOne();
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

    public async updateReportWithNewReportStatus(reportId: number, reportStatusId: number): Promise<boolean> {
        try {
            const result = await this.reportRepository.createQueryBuilder('report_entity')
                .update()
                .set({ reportStatusId })
                .where("report_entity.reportId = :reportId", { reportId })
                .execute();
    
            return result.affected > 0;
        } catch (error) {
            console.error('Error updating report with new report status', error);
            return false;
        }
    }
    

}
