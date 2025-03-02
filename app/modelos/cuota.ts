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
  declare id_usuario_carga: number;
  declare id_usuario_rendicion: CreationOptional<number>;
  declare rendido: boolean | null;
  declare fecha_carga: Date | null;
  declare fecha_rendicion: Date | null;
  declare monto: number;
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
      id_usuario_carga: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_usuario_rendicion: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      rendido: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      fecha_carga: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      fecha_rendicion: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'cuota',
      timestamps: false,
    }
  );
};
