import { Model, DataTypes, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import DataBaseConnection from '../lib/sequelize';

export class Cuota extends Model<
  InferAttributes<Cuota>,
  InferCreationAttributes<Cuota>
> {
  declare id: CreationOptional<number>;
  declare id_socio: number;
  declare anio: number;
  declare mes: number | null;
  declare estado: 'rendida' | 'pagada' | 'pendiente';
  declare medio_pago: 'cobradora-efectivo' | 'transferencia' | 'buffet-efectivo';
  declare id_usuario: number;
  declare rendido: boolean | null;
}

export const initCuota = async () => {
  const sequelize = await DataBaseConnection.getSequelizeInstance();

  Cuota.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_socio: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      anio: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mes: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      estado: {
        type: DataTypes.ENUM('rendida', 'pagada', 'pendiente'),
        allowNull: true,
        defaultValue: 'pendiente',
      },
      medio_pago: {
        type: DataTypes.ENUM('cobradora-efectivo', 'transferencia', 'buffet-efectivo'),
        allowNull: false,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rendido: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: 'cuota',
      timestamps: false,
    }
  );
};
