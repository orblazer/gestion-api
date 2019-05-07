import UserResolver from './admin/user/resolver'
import WebsiteResolver from './admin/website/resolver'
import WebsiteTemplateResolver from './admin/websiteTemplate/resolver'
import ServiceResolver from './modules/service/resolver'
import VehicleResolver from './modules/vehicle/resolver'

export default [
  // Admin
  UserResolver,
  WebsiteResolver,
  WebsiteTemplateResolver,
  // Modules
  ServiceResolver,
  VehicleResolver
]
