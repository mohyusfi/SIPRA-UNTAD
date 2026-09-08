CREATE INDEX "report_photos_reportId_idx" ON "report_photos" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "report_timeline_reportId_idx" ON "report_timeline" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "reports_categoryId_idx" ON "reports" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "reports_locationId_idx" ON "reports" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "reports_reporterId_idx" ON "reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "reports_assignedTechnicianId_idx" ON "reports" USING btree ("assigned_technician_id");--> statement-breakpoint
CREATE INDEX "reports_createdAt_idx" ON "reports" USING btree ("created_at");