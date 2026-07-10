<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "DejaVu Sans", Arial, sans-serif; font-size: 11px; color: #1a1a2e; line-height: 1.5; }
  .header { background: linear-gradient(135deg, #6c63ff, #00d4aa); padding: 32px 40px; color: white; }
  .header h1 { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
  .header .title { font-size: 14px; opacity: 0.9; margin-top: 4px; }
  .header .contact { display: flex; gap: 20px; margin-top: 12px; font-size: 10px; opacity: 0.85; flex-wrap: wrap; }
  .body { padding: 28px 40px; }
  .section { margin-bottom: 22px; }
  .section-title { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #6c63ff; border-bottom: 2px solid #6c63ff; padding-bottom: 4px; margin-bottom: 12px; }
  .summary { color: #374151; line-height: 1.7; font-size: 11px; }
  .exp-item { margin-bottom: 14px; }
  .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
  .exp-role { font-weight: 700; font-size: 12px; }
  .exp-company { color: #6c63ff; font-weight: 600; }
  .exp-duration { font-size: 10px; color: #6b7280; }
  .exp-desc { color: #4b5563; margin-top: 4px; padding-left: 12px; }
  .edu-item { margin-bottom: 10px; }
  .edu-degree { font-weight: 700; font-size: 12px; }
  .edu-institution { color: #6c63ff; }
  .edu-year { font-size: 10px; color: #6b7280; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill-tag { background: #6c63ff18; color: #4338ca; padding: 3px 10px; border-radius: 100px; font-size: 10px; font-weight: 500; border: 1px solid #6c63ff44; }
  .project-item { margin-bottom: 12px; }
  .project-name { font-weight: 700; font-size: 12px; }
  .project-tech { color: #6c63ff; font-size: 10px; margin-top: 2px; }
  .project-desc { color: #4b5563; margin-top: 4px; }
  .footer { background: #f8fafc; padding: 12px 40px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 9px; color: #9ca3af; }
</style>
</head>
<body>
<div class="header">
  <h1>{{ $data->personal_info['name'] ?? 'Your Name' }}</h1>
  @if(!empty($data->personal_info['title']))<div class="title">{{ $data->personal_info['title'] }}</div>@endif
  <div class="contact">
    @if(!empty($data->personal_info['email']))<span>✉ {{ $data->personal_info['email'] }}</span>@endif
    @if(!empty($data->personal_info['phone']))<span>📱 {{ $data->personal_info['phone'] }}</span>@endif
    @if(!empty($data->personal_info['location']))<span>📍 {{ $data->personal_info['location'] }}</span>@endif
    @if(!empty($data->personal_info['linkedin']))<span>in {{ $data->personal_info['linkedin'] }}</span>@endif
    @if(!empty($data->personal_info['github']))<span>gh {{ $data->personal_info['github'] }}</span>@endif
  </div>
</div>

<div class="body">
  @if(!empty($data->ai_summary))
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <div class="summary">{{ $data->ai_summary }}</div>
  </div>
  @endif

  @if(!empty($data->experience))
  <div class="section">
    <div class="section-title">Experience</div>
    @foreach($data->experience as $exp)
    <div class="exp-item">
      <div class="exp-header">
        <div>
          <span class="exp-role">{{ $exp['title'] ?? '' }}</span>
          @if(!empty($exp['company'])) · <span class="exp-company">{{ $exp['company'] }}</span>@endif
        </div>
        @if(!empty($exp['duration']))<div class="exp-duration">{{ $exp['duration'] }}</div>@endif
      </div>
      @if(!empty($exp['description']))<div class="exp-desc">{{ $exp['description'] }}</div>@endif
    </div>
    @endforeach
  </div>
  @endif

  @if(!empty($data->education))
  <div class="section">
    <div class="section-title">Education</div>
    @foreach($data->education as $edu)
    <div class="edu-item">
      <div class="edu-degree">{{ $edu['degree'] ?? '' }}</div>
      <div>
        @if(!empty($edu['institution']))<span class="edu-institution">{{ $edu['institution'] }}</span>@endif
        @if(!empty($edu['year'])) · <span class="edu-year">{{ $edu['year'] }}</span>@endif
      </div>
    </div>
    @endforeach
  </div>
  @endif

  @if(!empty($data->skills))
  <div class="section">
    <div class="section-title">Skills</div>
    <div class="skills-grid">
      @foreach(array_slice($data->skills['technical'] ?? $data->skills, 0, 20) as $skill)
      <span class="skill-tag">{{ $skill }}</span>
      @endforeach
    </div>
  </div>
  @endif

  @if(!empty($data->projects))
  <div class="section">
    <div class="section-title">Projects</div>
    @foreach($data->projects as $proj)
    <div class="project-item">
      <div class="project-name">{{ $proj['name'] ?? '' }}</div>
      @if(!empty($proj['tech']))<div class="project-tech">{{ is_array($proj['tech']) ? implode(', ', $proj['tech']) : $proj['tech'] }}</div>@endif
      @if(!empty($proj['description']))<div class="project-desc">{{ $proj['description'] }}</div>@endif
    </div>
    @endforeach
  </div>
  @endif
</div>

<div class="footer">Generated by TalentBridge · AI-Powered Career Platform · talentbridge.ai</div>
</body>
</html>
