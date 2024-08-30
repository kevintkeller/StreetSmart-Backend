import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CityEntity } from "../models/city.entity";
import { Repository } from "typeorm";
import { CityZipEntity } from "../models/city-zip.entity";

@Injectable()
export class CityService {
    constructor(@InjectRepository(CityEntity) private readonly citiesRepository: Repository<CityEntity>,
                @InjectRepository(CityZipEntity) private readonly cityZipsRepository: Repository<CityZipEntity>) {}

    public async getCityIdByZipCode(zipCode: string): Promise<number> {
        const result = await this.cityZipsRepository.createQueryBuilder('city_zip_entity')
            .where('city_zip_entity.zipCode = :zipCode', { zipCode })
            .getOne();
        return result.cityId;
    }
}