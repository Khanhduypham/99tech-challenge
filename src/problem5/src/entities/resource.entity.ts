import { Entity, Column } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ResourceType } from "../modules/resource/enum/resource-type.enum";

@Entity()
export class Resource extends BaseEntity {
  @Column()
  name!: string;

  @Column({
    nullable: true
  })
  description?: string;

  @Column({
    default: ResourceType.OTHER,
  })
  type!: ResourceType;
}
