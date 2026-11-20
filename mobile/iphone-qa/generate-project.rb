require 'xcodeproj'

name = 'CardTuckPhoneQA'
project_path = "#{name}.xcodeproj"
project = Xcodeproj::Project.new(project_path)
app = project.new_target(:application, name, :ios, '18.0', nil, :swift)
tests = project.new_target(:ui_test_bundle, "#{name}Tests", :ios, '18.0', nil, :swift)
tests.add_dependency(app)

app.source_build_phase.add_file_reference(project.new_file('App/CardTuckPhoneQA.swift'))
tests.source_build_phase.add_file_reference(project.new_file('Tests/PhoneHandoffTests.swift'))

app.build_configurations.each do |configuration|
  configuration.build_settings.merge!(
    'PRODUCT_BUNDLE_IDENTIFIER' => 'app.cardtuck.phone.qa',
    'INFOPLIST_FILE' => 'App/Info.plist',
    'SWIFT_VERSION' => '5.0',
  )
end

tests.build_configurations.each do |configuration|
  configuration.build_settings.merge!(
    'PRODUCT_BUNDLE_IDENTIFIER' => 'app.cardtuck.phone.qa.tests',
    'TEST_TARGET_NAME' => name,
    'GENERATE_INFOPLIST_FILE' => 'YES',
    'SWIFT_VERSION' => '5.0',
  )
end

project.save
scheme = Xcodeproj::XCScheme.new
scheme.configure_with_targets(app, tests, launch_target: true)
scheme.save_as(project_path, name, true)
