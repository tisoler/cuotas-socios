import {
  CreationOptional,
	DataTypes,
	InferAttributes,
	InferCreationAttributes,
	Model,
} from 'sequelize'
import DataBaseConnection from '../lib/sequelize'
import { Cuota, initCuota } from './cuota'

export class Socio extends Model<
  InferAttributes<Socio>,
  InferCreationAttributes<Socio>
> {
	declare id: CreationOptional<number>
	declare nombre: string
	declare domicilio: string
  declare dni: string
	declare tipo_pago: 'anual' | 'mensual' | 'bonificado/a' | 'becado/a'
	declare estado_socio: CreationOptional<'al-dia' | 'moroso'>
  declare medio_pago: 'cobradora-efectivo' | 'transferencia' | 'buffet-efectivo'
  declare telefono_contacto: string
  declare cuotas?: Cuota[];
  declare actividad: string;
  declare fecha_inicio: string;
  declare plan_familiar: string;
  declare otros_miembros: string;
  declare numero_socio: string;
}

export const initSocio = async () => {
	const sequelize = await DataBaseConnection.getSequelizeInstance()

	Socio.init(
		{
			id: {
        type: DataTypes.NUMBER,
        primaryKey: true,
        autoIncrement: true,
      },
			nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
			domicilio: {
        type: DataTypes.STRING,
        allowNull: false,
      },
			dni: {
        type: DataTypes.STRING,
        allowNull: false,
      },
			actividad: {
        type: DataTypes.STRING,
        allowNull: false,
      },
			fecha_inicio: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tipo_pago: {
        type: DataTypes.ENUM('anual', 'mensual'),
        allowNull: false,
      },
      medio_pago: {
        type: DataTypes.ENUM('cobradora-efectivo', 'transferencia', 'buffet-efectivo'),
        allowNull: false,
      },
      telefono_contacto: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      plan_familiar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      otros_miembros: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      numero_socio: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      estado_socio: {
        type: DataTypes.VIRTUAL,
        allowNull: true,
      },
		},
		{
			sequelize,
			tableName: 'socio',
			timestamps: false
		}
	);

  await initCuota();

  if (!Socio.associations.cuotas) {
    Socio.hasMany(Cuota, {
      foreignKey: 'id_socio',
      as: 'cuotas',
    });

    Cuota.belongsTo(Socio, {
      foreignKey: 'id_socio',
      as: 'socio',
    });
  }
}
