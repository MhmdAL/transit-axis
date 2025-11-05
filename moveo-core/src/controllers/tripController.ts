import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { tripMetricsService } from '../services/tripMetricsService';

const prisma = new PrismaClient();

// Helper function to send trip events to moveo-cc-api
const sendTripEvent = async (eventType: 'trip:start' | 'trip:end', tripData: any) => {
  try {
    const ccApiUrl = process.env.CC_API_URL || 'http://moveo-cc-api:3004';
    const event = {
      id: tripData.id.toString(),
      routeId: tripData.routeId.toString(),
      vehicleId: tripData.vehicleId.toString(),
      driverId: tripData.driverId.toString(),
      tripDutyId: tripData.tripDuty?.id.toString(),
      eventType,
      timestamp: Date.now(),
      startTime: tripData.startTime?.toISOString(),
      endTime: tripData.endTime?.toISOString(),
      status: tripData.status || 'inProgress'
    };

    const response = await fetch(`${ccApiUrl}/api/trip-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      console.error(`Failed to send ${eventType} event:`, response.statusText);
    }
  } catch (error) {
    console.error(`Error sending ${eventType} event:`, error);
    // Don't fail the trip operation if event sending fails
  }
};

export const tripController = {
  async getAllTrips(req: Request, res: Response, next: NextFunction) {
    try {
      const trips = await prisma.trip.findMany({
        include: {
          route: true,
          driver: true,
          vehicle: { include: { model: true } },
          tripStops: {
            include: { stop: { include: { location: true } } },
            orderBy: { stopOrder: 'asc' }
          }
        }
      });

      res.json({
        success: true,
        data: trips
      });
    } catch (error) {
      return next(error);
    }
  },

  async getTripById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const trip = await prisma.trip.findUnique({
        where: { id: BigInt(id) },
        include: {
          route: {
            include: {
              routeStops: {
                include: { stop: { include: { location: true } } },
                orderBy: { stopOrder: 'asc' }
              }
            }
          },
          driver: true,
          vehicle: { include: { model: true } },
          tripStops: {
            include: { stop: { include: { location: true } } },
            orderBy: { stopOrder: 'asc' }
          }
        }
      });

      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      res.json({
        success: true,
        data: trip
      });
    } catch (error) {
      return next(error);
    }
  },

  async createTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        routeId,
        driverId,
        vehicleId,
        tripDutyId,
        timestamp
      } = req.body;

      // Fetch the route with its stops to create trip stops later
      const route = await prisma.route.findUnique({
        where: { id: BigInt(routeId) },
        include: {
          routeStops: {
            orderBy: { stopOrder: 'asc' }
          }
        }
      });

      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Route not found'
        });
      }

      // Create trip and trip stops in a transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Create the trip
        const trip = await tx.trip.create({
          data: {
            routeId: BigInt(routeId),
            driverId: BigInt(driverId),
            vehicleId: BigInt(vehicleId),
            tripDutyId: BigInt(tripDutyId),
            startTime: timestamp ? new Date(timestamp) : new Date(),
            startLocation: 1,
          }
        });

        // Create trip stops based on route stops
        if (route.routeStops && route.routeStops.length > 0) {
          await tx.tripStop.createMany({
            data: route.routeStops.map((routeStop) => ({
              tripId: trip.id,
              stopId: routeStop.stopId,
              stopOrder: routeStop.stopOrder,
              eta: routeStop.eta
            }))
          });
        }

        // Fetch the complete trip with all relations
        return await tx.trip.findUnique({
          where: { id: trip.id },
          include: {
            route: true,
            driver: true,
            vehicle: { include: { model: true } },
            tripDuty: true,
            tripStops: {
              include: { stop: { include: { location: true } } },
              orderBy: { stopOrder: 'asc' }
            }
          }
        });
      });

      // Send trip:start event to moveo-cc-api
      await sendTripEvent('trip:start', result);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Trip created successfully with stops'
      });
    } catch (error) {
      return next(error);
    }
  },

  async updateTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const {
        routeId,
        scheduledStartTime,
        scheduledEndTime,
        scheduledDriverId,
        scheduledVehicleId,
        driverId,
        vehicleId
      } = req.body;

      const trip = await prisma.trip.update({
        where: { id: BigInt(id) },
        data: {
          routeId: routeId ? BigInt(routeId) : undefined,
          driverId: driverId ? BigInt(driverId) : undefined,
          vehicleId: vehicleId ? BigInt(vehicleId) : undefined
        },
        include: {
          route: true,
          driver: true,
          vehicle: { include: { model: true } }
        }
      });

      res.json({
        success: true,
        data: trip
      });
    } catch (error) {
      return next(error);
    }
  },

  async deleteTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      await prisma.trip.delete({
        where: { id: BigInt(id) }
      });

      res.json({
        success: true,
        message: 'Trip deleted successfully'
      });
    } catch (error) {
      return next(error);
    }
  },

  async startTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { startLocation } = req.body;

      const trip = await prisma.trip.update({
        where: { id: BigInt(id) },
        data: {
          startTime: new Date(),
          startLocation: startLocation ? BigInt(startLocation) : undefined
        },
        include: {
          route: true,
          driver: true,
          vehicle: { include: { model: true } }
        }
      });

      res.json({
        success: true,
        data: trip,
        message: 'Trip started successfully'
      });
    } catch (error) {
      return next(error);
    }
  },

  async endTrip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { endLocation, endTime } = req.body;

      // First get the trip to retrieve vehicleId
      const existingTrip = await prisma.trip.findUnique({
        where: { id: BigInt(id) },
        include: {
          tripDuty: true
        }
      });

      if (!existingTrip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      // Fetch telemetry path and calculate metrics in parallel
      let telemetryPath = null;
      let metrics = {
        averageSpeed: null as number | null,
        maxSpeed: null as number | null,
        totalDistance: null as number | null,
        totalDuration: null as number | null
      };

      if (existingTrip.vehicleId) {
        try {
          // Fetch both path and metrics in parallel
          const [pathResponse, metricsResult] = await Promise.all([
            // Fetch polyline path
            (async () => {
              try {
                const telemetryServiceUrl = process.env.TELEMETRY_SERVICE_API_URL || 'http://localhost:3003';
                const url = `${telemetryServiceUrl}/api/telemetry/${existingTrip.vehicleId}/path?tripId=${id}`;
                const response = await fetch(url);

                if (response.ok) {
                  const data: any = await response.json();
                  if (data?.success && data?.data?.polyline) {
                    return data.data.polyline;
                  }
                }
                return null;
              } catch (error) {
                console.error('Failed to fetch telemetry path:', error);
                return null;
              }
            })(),
            // Calculate trip metrics
            tripMetricsService.calculateTripMetricsFromTelemetry(
              existingTrip.vehicleId,
              BigInt(id)
            )
          ]);

          telemetryPath = pathResponse;
          metrics = metricsResult;
        } catch (error) {
          console.error('Error fetching telemetry data:', error);
          // Don't fail the trip end if telemetry fetch fails
        }
      }

      console.log(endTime);

      const updateData: any = {
        endTime: endTime ? new Date(endTime) : new Date(),
        endLocation: endLocation ? BigInt(endLocation) : undefined,
        path: telemetryPath
      };

      // Only add metrics if they were successfully calculated
      if (metrics.averageSpeed !== null) {
        updateData.averageSpeed = metrics.averageSpeed;
      }
      if (metrics.maxSpeed !== null) {
        updateData.maxSpeed = metrics.maxSpeed;
      }
      if (metrics.totalDistance !== null) {
        updateData.totalDistance = metrics.totalDistance;
      }
      if (metrics.totalDuration !== null) {
        updateData.totalDuration = metrics.totalDuration;
      }

      const trip = await prisma.trip.update({
        where: { id: BigInt(id) },
        data: updateData,
        include: {
          route: true,
          driver: true,
          vehicle: { include: { model: true } }
        }
      });

      // Send trip:end event to moveo-cc-api
      await sendTripEvent('trip:end', trip);

      res.json({
        success: true,
        data: trip,
        message: 'Trip ended successfully'
      });
    } catch (error) {
      return next(error);
    }
  },

  async getTripStops(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const tripStops = await prisma.tripStop.findMany({
        where: { tripId: BigInt(id) },
        include: {
          stop: { include: { location: true } }
        },
        orderBy: { stopOrder: 'asc' }
      });

      res.json({
        success: true,
        data: tripStops
      });
    } catch (error) {
      return next(error);
    }
  },

  async arriveAtStop(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: tripId, stopId } = req.params;

      const tripStop = await prisma.tripStop.update({
        where: {
          id: BigInt(stopId) // Assuming this is the tripStop ID
        },
        data: {
          arrivalTime: new Date()
        },
        include: {
          stop: { include: { location: true } }
        }
      });

      res.json({
        success: true,
        data: tripStop,
        message: 'Arrived at stop successfully'
      });
    } catch (error) {
      return next(error);
    }
  },

  async departFromStop(req: Request, res: Response, next: NextFunction) {
    try {
      const { id: tripId, stopId } = req.params;

      const tripStop = await prisma.tripStop.update({
        where: {
          id: BigInt(stopId) // Assuming this is the tripStop ID
        },
        data: {
          departureTime: new Date()
        },
        include: {
          stop: { include: { location: true } }
        }
      });

      res.json({
        success: true,
        data: tripStop,
        message: 'Departed from stop successfully'
      });
    } catch (error) {
      return next(error);
    }
  },

  async getTripDutiesByDateAndRoutes(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, routeIds } = req.query;

      if (!date || !routeIds) {
        return res.status(400).json({
          success: false,
          message: 'Date and routeIds parameters are required'
        });
      }

      // Parse date string (YYYY-MM-DD format)
      const selectedDate = new Date(date as string);
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);

      // Parse route IDs
      const routeIdArray = (routeIds as string).split(',').map(id => BigInt(id));

      // Fetch trip duties with related entities
      const tripDuties = await prisma.tripDuty.findMany({
        where: {
          routeId: {
            in: routeIdArray
          },
          duty: {
            date: {
              gte: selectedDate,
              lt: nextDate
            }
          }
        },
        include: {
          route: true,
          Trip: true,
          duty: {
            include: {
              driver: {
                include: {
                  user: true
                }
              },
              vehicle: {
                include: {
                  model: true
                }
              }
            }
          }
        },
        orderBy: [
          { routeId: 'asc' },
          { duty: { startTime: 'asc' } }
        ]
      });

      res.json({
        success: true,  
        data: tripDuties.map(tripDuty => ({
          ...tripDuty,
          trip: tripDuty.Trip?.length > 0 ? tripDuty.Trip[0] : null,
          startTime: tripDuty.duty?.startTime,
          endTime: tripDuty.duty?.endTime,
          driver: tripDuty.duty?.driver ? { ...tripDuty.duty?.driver, name: tripDuty.duty?.driver?.user?.name } : null,
          vehicle: tripDuty.duty?.vehicle,
          status: ['completed', 'inProgress', 'pending', 'delayed'][Math.floor(Math.random() * 4)]
        })),
        message: 'Trip duties fetched successfully'
      });
    } catch (error) {
      return next(error);
    }
  },

  async getTripDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const trip = await prisma.trip.findUnique({
        where: { id: BigInt(id) },
        include: {
          route: {
            include: {
              routeStops: {
                include: { stop: true },
                orderBy: { stopOrder: 'asc' }
              }
            }
          },
          driver: {
            include: {
              user: true
            }
          },
          vehicle: { include: { model: true } },
          tripDuty: true,
          tripStops: {
            include: {
              stop: { include: { location: true } }
            },
            orderBy: { stopOrder: 'asc' }
          }
        }
      });

      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found'
        });
      }

      res.json({
        success: true,
        data: {
          id: trip.id.toString(),
          routeName: trip.route?.name,
          driverName: trip.driver?.user?.name,
          vehicleFleetNo: trip.vehicle?.fleetNo,
          startTime: trip.startTime,
          endTime: trip.endTime,
          route: trip.route,
          driver: trip.driver,
          vehicle: trip.vehicle,
          tripStops: trip.tripStops.map(ts => ({
            id: ts.id.toString(),
            stopId: ts.stopId.toString(),
            stopOrder: ts.stopOrder,
            stopName: ts.stop?.name,
            eta: ts.eta,
            arrivalTime: ts.arrivalTime,
            departureTime: ts.departureTime,
            location: ts.stop?.location
          })),
          routeStops: trip.route?.routeStops.map(rs => ({
            stopOrder: rs.stopOrder,
            eta: rs.eta,
            waitTime: rs.waitTime
          })) || []
        }
      });
    } catch (error) {
      return next(error);
    }
  }
};
