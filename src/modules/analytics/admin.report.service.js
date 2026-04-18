import db from '../../db.js'

export const adminReportService = {
  async getReports({ status, limit = 20 }) {
    const where = {}

    if (status) {
      where.status = status
    }

    const reports = await db.listingReport.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        listing: {
          select: {
            id: true,
            name: true,
            status: true,
            ownerId: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return {
      data: reports
    }
  },

  async reviewReport(adminId, reportId, action) {
    const report = await db.listingReport.findFirst({
      where: {
        id: reportId
      },
      include: {
        listing: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    })

    if (!report) {
      return { error: 'Report not found', status: 404 }
    }

    if (report.status !== 'PENDING') {
      return { error: 'Report already reviewed', status: 400 }
    }

    if (!['DISMISS', 'DEACTIVATE_LISTING'].includes(action)) {
      return { error: 'Invalid action', status: 400 }
    }

    const now = new Date()

    if (action === 'DISMISS') {
      const updatedReport = await db.listingReport.update({
        where: { id: reportId },
        data: {
          status: 'DISMISSED',
          action: 'DISMISS',
          reviewedAt: now,
          reviewedById: adminId
        }
      })

      return {
        data: {
          id: updatedReport.id,
          status: updatedReport.status,
          action: updatedReport.action,
          listingId: updatedReport.listingId,
          message: 'Report dismissed successfully'
        }
      }
    }

    const result = await db.$transaction(async (tx) => {
      await tx.kostListing.update({
        where: { id: report.listingId },
        data: {
          status: 'INACTIVE'
        }
      })

      const updatedReport = await tx.listingReport.update({
        where: { id: reportId },
        data: {
          status: 'RESOLVED',
          action: 'DEACTIVATE_LISTING',
          reviewedAt: now,
          reviewedById: adminId
        }
      })

      return updatedReport
    })

    return {
      data: {
        id: result.id,
        status: result.status,
        action: result.action,
        listingId: result.listingId,
        message: 'Report reviewed and listing deactivated successfully'
      }
    }
  }
}