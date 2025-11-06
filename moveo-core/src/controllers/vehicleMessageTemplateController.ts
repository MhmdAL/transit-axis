import { Request, Response, NextFunction } from 'express';

export const vehicleMessageTemplateController = {
  async getMessageTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const templates = {
        success: true,
        data: {
          categories: [
            {
              id: 'traffic',
              name: 'Traffic & Route',
              color: '#FF9800',
              messages: [
                {
                  id: 'traffic_1',
                  title: 'Heavy Traffic Alert',
                  text: 'Heavy traffic detected ahead. Estimated delay: 15 minutes. Maintain safe distance.',
                  severity: 'WARNING'
                },
                {
                  id: 'traffic_2',
                  title: 'Route Diversion',
                  text: 'Accident reported on main route. Please follow alternative route provided by GPS.',
                  severity: 'WARNING'
                },
                {
                  id: 'traffic_3',
                  title: 'Road Closure',
                  text: 'Road closure on your current route. Updated route has been sent to your GPS.',
                  severity: 'CRITICAL'
                },
                {
                  id: 'traffic_4',
                  title: 'Clear Route',
                  text: 'Route is clear. You are on schedule. Continue with current route.',
                  severity: 'NORMAL'
                },
                {
                  id: 'traffic_5',
                  title: 'Construction Zone',
                  text: 'Construction zone ahead. Reduce speed and exercise caution.',
                  severity: 'WARNING'
                }
              ]
            },
            {
              id: 'maintenance',
              name: 'Maintenance & Vehicle',
              color: '#2196F3',
              messages: [
                {
                  id: 'maintenance_1',
                  title: 'Scheduled Maintenance',
                  text: 'Vehicle requires scheduled maintenance after this trip. Return to depot.',
                  severity: 'WARNING'
                },
                {
                  id: 'maintenance_2',
                  title: 'Tire Pressure Check',
                  text: 'Please check tire pressure at next stop. Fleet alert detected.',
                  severity: 'WARNING'
                },
                {
                  id: 'maintenance_3',
                  title: 'Engine Check Required',
                  text: 'Engine warning light detected. Return to depot for diagnostic check.',
                  severity: 'CRITICAL'
                },
                {
                  id: 'maintenance_4',
                  title: 'Fuel Level Low',
                  text: 'Fuel level is low. Please refuel at the next authorized station.',
                  severity: 'WARNING'
                },
                {
                  id: 'maintenance_5',
                  title: 'Brake System Alert',
                  text: 'Brake system alert detected. Exercise caution and proceed directly to depot.',
                  severity: 'CRITICAL'
                }
              ]
            },
            {
              id: 'safety',
              name: 'Safety & Compliance',
              color: '#F44336',
              messages: [
                {
                  id: 'safety_1',
                  title: 'Speed Limit Reminder',
                  text: 'Maintain safe speed. You are exceeding speed limits in this zone.',
                  severity: 'WARNING'
                },
                {
                  id: 'safety_2',
                  title: 'Seatbelt Reminder',
                  text: 'Ensure all passengers are properly seated and wearing seatbelts.',
                  severity: 'WARNING'
                },
                {
                  id: 'safety_3',
                  title: 'Hazardous Weather',
                  text: 'Hazardous weather conditions ahead. Reduce speed and increase following distance.',
                  severity: 'CRITICAL'
                },
                {
                  id: 'safety_4',
                  title: 'Safe Driving',
                  text: 'Great job maintaining safe driving practices. Keep up the good work!',
                  severity: 'NORMAL'
                },
                {
                  id: 'safety_5',
                  title: 'Emergency Stop',
                  text: 'EMERGENCY: Stop the vehicle immediately and contact dispatch.',
                  severity: 'CRITICAL'
                }
              ]
            },
            {
              id: 'administrative',
              name: 'Administrative & Schedule',
              color: '#4CAF50',
              messages: [
                {
                  id: 'admin_1',
                  title: 'Break Time Available',
                  text: 'You have 15 minutes break time available at next stop. Proceed when ready.',
                  severity: 'NORMAL'
                },
                {
                  id: 'admin_2',
                  title: 'Return to Depot',
                  text: 'End of route. Please return to depot. Route completed.',
                  severity: 'NORMAL'
                },
                {
                  id: 'admin_3',
                  title: 'Shift Ending',
                  text: 'Your shift will end in 30 minutes. Prepare to wrap up.',
                  severity: 'NORMAL'
                },
                {
                  id: 'admin_4',
                  title: 'Schedule Update',
                  text: 'Route schedule has been updated. Check your GPS for new timings.',
                  severity: 'WARNING'
                },
                {
                  id: 'admin_5',
                  title: 'Additional Assignment',
                  text: 'New assignment added to your route. Route details updated in your system.',
                  severity: 'NORMAL'
                }
              ]
            },
            {
              id: 'operational',
              name: 'Operational & Delivery',
              color: '#9C27B0',
              messages: [
                {
                  id: 'operational_1',
                  title: 'Next Stop',
                  text: 'Approaching next stop. Prepare for passenger pickup/dropoff.',
                  severity: 'NORMAL'
                },
                {
                  id: 'operational_2',
                  title: 'Wait for Instructions',
                  text: 'Wait for instructions at current stop. Dispatcher will contact you shortly.',
                  severity: 'NORMAL'
                },
                {
                  id: 'operational_3',
                  title: 'Route Ahead',
                  text: 'Multiple stops on this route. Maintain schedule. First stop in 5 minutes.',
                  severity: 'NORMAL'
                },
                {
                  id: 'operational_4',
                  title: 'Passenger Load',
                  text: 'Ensure all passengers are loaded and seated before proceeding.',
                  severity: 'WARNING'
                },
                {
                  id: 'operational_5',
                  title: 'Final Stop',
                  text: 'This is your final stop. Ensure all passengers have disembarked.',
                  severity: 'NORMAL'
                }
              ]
            },
            {
              id: 'communication',
              name: 'Communication & Support',
              color: '#00BCD4',
              messages: [
                {
                  id: 'comm_1',
                  title: 'Contact Dispatch',
                  text: 'Please contact dispatch immediately for important update.',
                  severity: 'WARNING'
                },
                {
                  id: 'comm_2',
                  title: 'System Update',
                  text: 'System update completed. All features are now available.',
                  severity: 'NORMAL'
                },
                {
                  id: 'comm_3',
                  title: 'Acknowledge Receipt',
                  text: 'Please acknowledge receipt of this message.',
                  severity: 'WARNING'
                },
                {
                  id: 'comm_4',
                  title: 'Check Email',
                  text: 'Important information has been sent to your email. Please review.',
                  severity: 'WARNING'
                },
                {
                  id: 'comm_5',
                  title: 'System Issue',
                  text: 'We detected an issue. Please report your current status and location.',
                  severity: 'CRITICAL'
                }
              ]
            }
          ],
          summary: {
            totalCategories: 6,
            totalTemplates: 30,
            severities: ['NORMAL', 'WARNING', 'CRITICAL']
          }
        }
      };

      res.json(templates);
    } catch (error) {
      return next(error);
    }
  },

  async getTemplatesByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;

      const allTemplates = {
        traffic: {
          id: 'traffic',
          name: 'Traffic & Route',
          messages: [
            {
              id: 'traffic_1',
              title: 'Heavy Traffic Alert',
              text: 'Heavy traffic detected ahead. Estimated delay: 15 minutes. Maintain safe distance.',
              severity: 'WARNING'
            },
            {
              id: 'traffic_2',
              title: 'Route Diversion',
              text: 'Accident reported on main route. Please follow alternative route provided by GPS.',
              severity: 'WARNING'
            },
            {
              id: 'traffic_3',
              title: 'Road Closure',
              text: 'Road closure on your current route. Updated route has been sent to your GPS.',
              severity: 'CRITICAL'
            },
            {
              id: 'traffic_4',
              title: 'Clear Route',
              text: 'Route is clear. You are on schedule. Continue with current route.',
              severity: 'NORMAL'
            },
            {
              id: 'traffic_5',
              title: 'Construction Zone',
              text: 'Construction zone ahead. Reduce speed and exercise caution.',
              severity: 'WARNING'
            }
          ]
        },
        maintenance: {
          id: 'maintenance',
          name: 'Maintenance & Vehicle',
          messages: [
            {
              id: 'maintenance_1',
              title: 'Scheduled Maintenance',
              text: 'Vehicle requires scheduled maintenance after this trip. Return to depot.',
              severity: 'WARNING'
            },
            {
              id: 'maintenance_2',
              title: 'Tire Pressure Check',
              text: 'Please check tire pressure at next stop. Fleet alert detected.',
              severity: 'WARNING'
            },
            {
              id: 'maintenance_3',
              title: 'Engine Check Required',
              text: 'Engine warning light detected. Return to depot for diagnostic check.',
              severity: 'CRITICAL'
            },
            {
              id: 'maintenance_4',
              title: 'Fuel Level Low',
              text: 'Fuel level is low. Please refuel at the next authorized station.',
              severity: 'WARNING'
            },
            {
              id: 'maintenance_5',
              title: 'Brake System Alert',
              text: 'Brake system alert detected. Exercise caution and proceed directly to depot.',
              severity: 'CRITICAL'
            }
          ]
        },
        safety: {
          id: 'safety',
          name: 'Safety & Compliance',
          messages: [
            {
              id: 'safety_1',
              title: 'Speed Limit Reminder',
              text: 'Maintain safe speed. You are exceeding speed limits in this zone.',
              severity: 'WARNING'
            },
            {
              id: 'safety_2',
              title: 'Seatbelt Reminder',
              text: 'Ensure all passengers are properly seated and wearing seatbelts.',
              severity: 'WARNING'
            },
            {
              id: 'safety_3',
              title: 'Hazardous Weather',
              text: 'Hazardous weather conditions ahead. Reduce speed and increase following distance.',
              severity: 'CRITICAL'
            },
            {
              id: 'safety_4',
              title: 'Safe Driving',
              text: 'Great job maintaining safe driving practices. Keep up the good work!',
              severity: 'NORMAL'
            },
            {
              id: 'safety_5',
              title: 'Emergency Stop',
              text: 'EMERGENCY: Stop the vehicle immediately and contact dispatch.',
              severity: 'CRITICAL'
            }
          ]
        },
        administrative: {
          id: 'administrative',
          name: 'Administrative & Schedule',
          messages: [
            {
              id: 'admin_1',
              title: 'Break Time Available',
              text: 'You have 15 minutes break time available at next stop. Proceed when ready.',
              severity: 'NORMAL'
            },
            {
              id: 'admin_2',
              title: 'Return to Depot',
              text: 'End of route. Please return to depot. Route completed.',
              severity: 'NORMAL'
            },
            {
              id: 'admin_3',
              title: 'Shift Ending',
              text: 'Your shift will end in 30 minutes. Prepare to wrap up.',
              severity: 'NORMAL'
            },
            {
              id: 'admin_4',
              title: 'Schedule Update',
              text: 'Route schedule has been updated. Check your GPS for new timings.',
              severity: 'WARNING'
            },
            {
              id: 'admin_5',
              title: 'Additional Assignment',
              text: 'New assignment added to your route. Route details updated in your system.',
              severity: 'NORMAL'
            }
          ]
        },
        operational: {
          id: 'operational',
          name: 'Operational & Delivery',
          messages: [
            {
              id: 'operational_1',
              title: 'Next Stop',
              text: 'Approaching next stop. Prepare for passenger pickup/dropoff.',
              severity: 'NORMAL'
            },
            {
              id: 'operational_2',
              title: 'Wait for Instructions',
              text: 'Wait for instructions at current stop. Dispatcher will contact you shortly.',
              severity: 'NORMAL'
            },
            {
              id: 'operational_3',
              title: 'Route Ahead',
              text: 'Multiple stops on this route. Maintain schedule. First stop in 5 minutes.',
              severity: 'NORMAL'
            },
            {
              id: 'operational_4',
              title: 'Passenger Load',
              text: 'Ensure all passengers are loaded and seated before proceeding.',
              severity: 'WARNING'
            },
            {
              id: 'operational_5',
              title: 'Final Stop',
              text: 'This is your final stop. Ensure all passengers have disembarked.',
              severity: 'NORMAL'
            }
          ]
        },
        communication: {
          id: 'communication',
          name: 'Communication & Support',
          messages: [
            {
              id: 'comm_1',
              title: 'Contact Dispatch',
              text: 'Please contact dispatch immediately for important update.',
              severity: 'WARNING'
            },
            {
              id: 'comm_2',
              title: 'System Update',
              text: 'System update completed. All features are now available.',
              severity: 'NORMAL'
            },
            {
              id: 'comm_3',
              title: 'Acknowledge Receipt',
              text: 'Please acknowledge receipt of this message.',
              severity: 'WARNING'
            },
            {
              id: 'comm_4',
              title: 'Check Email',
              text: 'Important information has been sent to your email. Please review.',
              severity: 'WARNING'
            },
            {
              id: 'comm_5',
              title: 'System Issue',
              text: 'We detected an issue. Please report your current status and location.',
              severity: 'CRITICAL'
            }
          ]
        }
      };

      const category = allTemplates[categoryId as keyof typeof allTemplates];

      if (!category) {
        return res.status(404).json({
          success: false,
          message: `Category '${categoryId}' not found. Available categories: ${Object.keys(allTemplates).join(', ')}`
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      return next(error);
    }
  }
};

