import { Controller, Post, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { AttendanceFilterDto } from './dto/attendance-filter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../entities/user.entity';

@ApiTags('Attendance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @ApiOperation({ summary: 'Today clock in & clock out' })
    @Get('today')
    today(@Request() req: any) {
        return this.attendanceService.getTodayAttendanceByUser(req.user.id);
    }

    @ApiOperation({ summary: 'Clock in / Check in' })
    @Post('check-in')
    checkIn(@Request() req: any) {
        return this.attendanceService.checkIn(req.user.id);
    }

    @ApiOperation({ summary: 'Clock out / Check out' })
    @Post('check-out')
    checkOut(@Request() req: any) {
        return this.attendanceService.checkOut(req.user.id);
    }

    @ApiOperation({ summary: 'Get login user attendance summary with optional date range' })
    @Get('my-history')
    getMyHistory(@Request() req: any, @Query() filter: AttendanceFilterDto) {
        return this.attendanceService.getMyAttendanceHistory(req.user.id, filter);
    }

    @ApiOperation({ summary: 'HRD Admin: View all attendance records' })
    @UseGuards(RolesGuard)
    @Roles(Role.HRD_ADMIN)
    @Get('admin/all')
    getAllAttendances(@Query() filter: AttendanceFilterDto) {
        return this.attendanceService.getAllAttendancesForHRD(filter);
    }
}