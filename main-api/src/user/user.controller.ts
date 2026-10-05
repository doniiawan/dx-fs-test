import { Controller, Put, Post, Get, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/admin-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../entities/user.entity';

@ApiTags('User Profile & Admin Management')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @ApiOperation({ summary: 'Employee: Update self profile (triggers RabbitMQ & WebSocket)' })
  @Put('profile')
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  // --- HRD ADMIN ENDPOINTS ---
  @ApiOperation({ summary: 'HRD Admin: Get list of all employees' })
  @UseGuards(RolesGuard)
  @Roles(Role.HRD_ADMIN)
  @Get('admin/employees')
  getAllEmployees() {
    return this.userService.getAllEmployees();
  }

  @ApiOperation({ summary: 'HRD Admin: Create a new employee' })
  @UseGuards(RolesGuard)
  @Roles(Role.HRD_ADMIN)
  @Post('admin/employee')
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.userService.createEmployee(dto);
  }

  @ApiOperation({ summary: 'HRD Admin: Update employee data' })
  @UseGuards(RolesGuard)
  @Roles(Role.HRD_ADMIN)
  @Put('admin/employee/:id')
  updateEmployeeByAdmin(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.userService.updateEmployeeByAdmin(id, dto);
  }

  @ApiOperation({ summary: 'HRD Admin: Delete employee' })
  @UseGuards(RolesGuard)
  @Roles(Role.HRD_ADMIN)
  @Delete('admin/employee/:id')
  deleteEmployee(@Param('id') id: string) {
    return this.userService.deleteEmployee(id);
  }
}