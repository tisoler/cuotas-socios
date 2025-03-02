import {
	DataTypes,
	InferAttributes,
	InferCreationAttributes,
	Model,
} from 'sequelize'
import DataBaseConnection from '../lib/sequelize'

export class Usuario extends Model<
  InferAttributes<Usuario>,
  InferCreationAttributes<Usuario>
> {
  declare id: number;
	declare nombre_usuario: string;
  declare password: string;
  declare rol: 'admin' | 'tesorero' | 'cobrador';
  declare color: string;
}

export const initUsuario = async () => {
	const sequelize = await DataBaseConnection.getSequelizeInstance()

	Usuario.init(
		{
      id: {
        type: DataTypes.NUMBER,
        primaryKey: true,
      },
			nombre_usuario: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      rol: {
        type: DataTypes.ENUM('admin', 'tesorero', 'cobrador'),
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: false,
      },
		},
		{
			sequelize,
			tableName: 'usuario',
			timestamps: false
		}
	)
}