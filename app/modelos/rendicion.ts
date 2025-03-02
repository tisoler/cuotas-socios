import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize'
import DataBaseConnection from '../lib/sequelize'
import { initUsuario, Usuario } from './usuario';

export class Rendicion extends Model<
  InferAttributes<Rendicion>,
  InferCreationAttributes<Rendicion>
> {
  declare id: CreationOptional<number>;
  declare id_usuario: number;
  declare fecha: Date;
  declare monto_rendido: number;
  declare comision: number;
  declare usuario?: Usuario;
}

export const initRendicion = async () => {
  const sequelize = await DataBaseConnection.getSequelizeInstance()

  Rendicion.init(
    {
      id: {
        type: DataTypes.NUMBER,
        primaryKey: true,
      },
      id_usuario: {
        type: DataTypes.NUMBER,
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      monto_rendido: {
        type: DataTypes.NUMBER,
        allowNull: false,
      },
      comision: {
        type: DataTypes.NUMBER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'rendicion',
      timestamps: false
    }
  )

  await initUsuario();
  
  if (!Usuario.associations.rendiciones) {
    Usuario.hasMany(Rendicion, {
      foreignKey: 'id_usuario',
      as: 'rendiciones',
    });

    Rendicion.belongsTo(Usuario, {
      foreignKey: 'id_usuario',
      as: 'usuario',
    });
  }
}
